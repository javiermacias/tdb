import os
import re
from bs4 import BeautifulSoup

# --- Configuración ---
CARPETA_FANZINES = 'fanzines'

def limpiar_y_estandarizar_html():
    """
    Recorre todos los archivos HTML en la carpeta de fanzines,
    busca y estandariza los formatos de notas al pie
    con enlaces de ida y vuelta.
    """
    if not os.path.isdir(CARPETA_FANZINES):
        print(f"Error: No se encontró la carpeta '{CARPETA_FANZINES}'.")
        return

    print(f"Iniciando la estandarización de notas al pie en '{CARPETA_FANZINES}' con retorno...")
    
    archivos_modificados = 0
    total_archivos = 0

    # Recorre cada archivo en la carpeta de fanzines
    for nombre_archivo in os.listdir(CARPETA_FANZINES):
        if nombre_archivo.endswith('.html'):
            total_archivos += 1
            ruta_completa = os.path.join(CARPETA_FANZINES, nombre_archivo)
            
            print(f"Procesando: {nombre_archivo}")
            
            try:
                with open(ruta_completa, 'r', encoding='utf-8') as f:
                    html_content = f.read()

                soup = BeautifulSoup(html_content, 'lxml')
                
                modificado = False
                
                # --- PASO 1: IDENTIFICAR Y ASIGNAR IDs ÚNICOS A LAS CITAS EN EL TEXTO PRINCIPAL ---
                # Esto es crucial para que los enlaces de retorno apunten a un lugar único.
                # Almacenamos: { 'numero_nota_al_pie': [ (sup_tag, id_generado_para_este_sup, a_tag_dentro_del_sup o None) ] }
                text_citation_occurrences = {} 
                
                # Recorremos todos los <sup> que pueden ser citas
                for i, sup_tag in enumerate(soup.find_all('sup')):
                    a_tag_inside_sup = sup_tag.find('a') # Changed variable name to avoid confusion with parameter
                    note_number = None

                    # Try to get note number from <a> tag first
                    if a_tag_inside_sup:
                        # Case 1: Old Word footnote link (sdfootnoteanc)
                        if 'sdfootnoteanc' in a_tag_inside_sup.get('class', []):
                            match_num = re.search(r'(\d+)', a_tag_inside_sup.get('id', '') + a_tag_inside_sup.get('name', ''))
                            if match_num:
                                note_number = match_num.group(1)
                                del a_tag_inside_sup['class'] # Clean up old Word class
                                modificado = True
                        # Case 2: Normal <a> within <sup> with a number
                        elif a_tag_inside_sup.string and re.match(r'^\d+$', a_tag_inside_sup.string.strip()):
                            note_number = a_tag_inside_sup.string.strip()
                    
                    # Case 3: Just a number in <sup> (no <a> inside)
                    if not note_number and sup_tag.string and re.match(r'^\d+$', sup_tag.string.strip()):
                        note_number = sup_tag.string.strip()
                        # If no <a>, create one to make it clickable
                        new_a_tag = soup.new_tag('a')
                        new_a_tag.string = sup_tag.string # Text of the link is the number
                        sup_tag.clear() # Clear existing content in <sup>
                        sup_tag.append(new_a_tag) # Add the new <a>
                        a_tag_inside_sup = new_a_tag # Update reference
                        modificado = True

                    if note_number:
                        # Assign a unique ID to this <sup> tag for return links
                        current_occurrence_id = f'nota_texto_{note_number}_{len(text_citation_occurrences.get(note_number, [])) + 1}'
                        sup_tag['id'] = current_occurrence_id
                        
                        # Store the reference: (sup_tag, its ID, and the <a> tag within it or None if not created)
                        if note_number not in text_citation_occurrences:
                            text_citation_occurrences[note_number] = []
                        text_citation_occurrences[note_number].append((sup_tag, current_occurrence_id, a_tag_inside_sup))
                        modificado = True
                    # else: No need for else pass here.

                # --- PASO 2: ESTANDARIZAR BLOQUES DE NOTAS AL PIE Y AÑADIR ENLACES DE RETORNO ---
                
                # Find all divs that could be footnotes (new class or old Word ID)
                all_footnote_divs = soup.find_all('div', class_='nota-al-pie')
                if not all_footnote_divs: 
                    all_footnote_divs = soup.find_all('div', id=re.compile(r'^sdfootnote\d+$'))

                for footnote_div in all_footnote_divs:
                    original_footnote_html_str = str(footnote_div) # Store original HTML for text extraction

                    note_number = None
                    # Try to extract note number from different sources within the footnote div
                    
                    # 2.1) From the div's ID (e.g., sdfootnote1)
                    num_match_in_id = re.search(r'(\d+)', footnote_div.get('id', ''))
                    if num_match_in_id:
                        note_number = num_match_in_id.group(1)
                    
                    # 2.2) From the first <sup> or <a> tag within the note's content
                    if not note_number:
                        first_num_tag = footnote_div.find(['sup', 'a'])
                        if first_num_tag and first_num_tag.string and re.match(r'^\d+$', first_num_tag.string.strip()):
                            note_number = first_num_tag.string.strip()
                    
                    # 2.3) From the beginning of the text of the first <p> within the note
                    if not note_number:
                        first_p_in_note = footnote_div.find('p')
                        if first_p_in_note:
                            num_match_in_p_text = re.search(r'^\s*(\d+)\s*', first_p_in_note.get_text().strip())
                            if num_match_in_p_text:
                                note_number = num_match_in_p_text.group(1)

                    if not note_number:
                        print(f"    -> Advertencia: No se pudo extraer el número de nota para una nota al pie en '{nombre_archivo}'. Saltando esta nota.")
                        continue 

                    # Procedemos a reconstruir la nota al pie
                    new_block_id = f'nota_bloque_{note_number}'
                    
                    # Clear the current div's content to rebuild it
                    footnote_div.clear() 

                    # Set the new ID and standard class
                    footnote_div['id'] = new_block_id
                    footnote_div['class'] = ['nota-al-pie']

                    # Create the new <p> content
                    new_p_tag = soup.new_tag('p')
                    
                    # Add the note number in <sup>
                    sup_num_tag = soup.new_tag('sup')
                    sup_num_tag.string = note_number
                    new_p_tag.append(sup_num_tag)
                    
                    # Add return link ↩
                    first_occurrence_id_for_return = None
                    if note_number in text_citation_occurrences and text_citation_occurrences[note_number]:
                        # text_citation_occurrences[note_number] es una lista de (sup_tag, id_generated, a_tag)
                        first_occurrence_id_for_return = text_citation_occurrences[note_number][0][1] 
                    
                    if first_occurrence_id_for_return:
                        return_link_tag = soup.new_tag('a', href=f"#{first_occurrence_id_for_return}")
                        return_link_tag.string = ' ↩' 
                        new_p_tag.append(return_link_tag)
                    
                    # Extract the clean text content from the original footnote HTML string
                    # This is a safer way to get the text after removing the initial number/link
                    temp_soup_for_text_extraction = BeautifulSoup(original_footnote_html_str, 'lxml')
                    
                    # Remover elementos que ya no queremos en el contenido (números, enlaces de retorno viejos)
                    if temp_soup_for_text_extraction.body: 
                        # Extract all contents from body to process
                        all_children_of_body_in_temp_soup = list(temp_soup_for_text_extraction.body.contents)
                        
                        for child in all_children_of_body_in_temp_soup:
                            if child.name in ['sup', 'a']: # Check if it's a <sup> or <a> tag
                                if child.string and re.match(r'^\s*\d+\s*$', child.string.strip()): # If it's a number citation
                                    child.extract()
                                elif child.string and re.search(r'↩|\[Volver\]|Regresar|Retorno', child.string): # If it's an old return link
                                    child.extract()
                                elif 'sdfootnoteanc' in child.get('class', []): # If it's an old Word link
                                    child.extract()
                            elif child.name == 'p': # If it's a paragraph
                                # Also remove leading number from the p's string content if it was like '1 Some text'
                                if isinstance(child.string, str) and re.match(r'^\s*\d+\s*', child.string.strip()):
                                    child.string = re.sub(r'^\s*\d+\s*', '', child.string.strip())
                                # Also remove sup/a inside p that are old citations
                                for inner_tag in child.find_all(['sup', 'a']):
                                    if inner_tag.string and (re.match(r'^\s*\d+\s*$', inner_tag.string.strip()) or re.search(r'↩|\[Volver\]|Regresar|Retorno', inner_tag.string)):
                                        inner_tag.extract()
                                    elif 'sdfootnoteanc' in inner_tag.get('class', []):
                                        inner_tag.extract()
                                        
                    # Get the final clean HTML content of the footnote from the body's new state
                    clean_footnote_content_html = ''.join(str(child) for child in temp_soup_for_text_extraction.body.contents if child).strip()
                    
                    # Append the clean content to the new <p> tag
                    new_p_tag.append(BeautifulSoup(clean_footnote_content_html, 'html.parser'))
                    
                    new_footnote_div.append(new_p_tag)
                    
                    # Replace the old div with the new one
                    footnote_div.replace_with(new_footnote_div)
                    modificado = True

                # --- PASO 3: ASEGURAR QUE LOS ENLACES EN EL TEXTO PRINCIPAL APUNTEN CORRECTAMENTE ---
                # Iteramos sobre las ocurrencias que identificamos en PASO 1.
                for note_number_key, occurrences_list in text_citation_occurrences.items():
                    for sup_tag_in_text, occurrence_id_in_text, a_tag_in_text_orig in occurrences_list:
                        if a_tag_in_text_orig: # Ensure the <a> tag exists
                            # The href should point to the standardized block ID
                            new_target_href = f"#nota_bloque_{note_number_key}"
                            if a_tag_in_text_orig.get('href') != new_target_href:
                                a_tag_in_text_orig['href'] = new_target_href
                                modificado = True
                
                # --- Save the file if modified ---
                if modificado:
                    with open(ruta_completa, 'w', encoding='utf-8') as f:
                        f.write(str(soup))
                    archivos_modificados += 1

            except Exception as e:
                print(f"  -> ERROR al procesar el archivo {nombre_archivo}: {e}")
                import traceback
                traceback.print_exc() # Print full traceback for debugging

    print("\n¡Estandarización completada!")
    print(f"Se revisaron {total_archivos} archivos HTML.")
    print(f"Total de archivos modificados: {archivos_modificados}.")

if __name__ == "__main__":
    print("------------------------------------------------------------------------------------------")
    print("¡ATENCIÓN! Este script modificará tus archivos HTML directamente.")
    print("Se recomienda ENCARECIDAMENTE hacer una COPIA DE SEGURIDAD de tu carpeta del proyecto antes de ejecutarlo.")
    print("------------------------------------------------------------------------------------------\n")
    
    confirm = input("¿Has hecho una copia de seguridad y deseas continuar? (s/n): ").lower()
    if confirm == 's':
        limpiar_y_estandarizar_html()
    else:
        print("Operación cancelada. Por favor, haz una copia de seguridad de tus archivos.")