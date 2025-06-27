import os
import sys
from bs4 import BeautifulSoup, Tag

def make_logo_clickable_and_fix_paths(html_filepath):
    """
    Hace que el logo en la barra de navegación sea clickeable y apunte a inicio.html,
    y corrige las rutas relativas en los enlaces del menú.
    """
    try:
        with open(html_filepath, 'r', encoding='utf-8') as f:
            html_content = f.read()
    except FileNotFoundError:
        print(f"Error: Archivo no encontrado en '{html_filepath}'. Saltando.")
        return False
    except Exception as e:
        print(f"Error al leer '{html_filepath}': {e}. Saltando.")
        return False

    soup = BeautifulSoup(html_content, 'html.parser')
    nav_tag = soup.find('nav', class_='menu')

    if not nav_tag:
        print(f"Advertencia: No se encontró la etiqueta <nav class='menu'> en '{html_filepath}'. Saltando.")
        return False

    modificado = False

    # 1. Determinar rutas relativas (./ o ../)
    # Asume que las subcarpetas son de un solo nivel (ej. fanzines/fanzine.html)
    # y los recursos principales (logo, index.html) están en la carpeta raíz.
    is_in_subdirectory = os.path.basename(os.path.dirname(html_filepath)) != os.path.basename(os.getcwd())
    
    if is_in_subdirectory:
        root_path_prefix = "../"
    else:
        root_path_prefix = "./"

    # 2. Hacer el logo clickeable y ajustar su ruta src
    logo_img_tag = nav_tag.find('img', class_='logo')
    if logo_img_tag:
        # Asegurarse de que la ruta src del logo sea correcta (siempre con el prefijo correcto)
        expected_logo_src = f"{root_path_prefix}logo tdb.png"
        if logo_img_tag.get('src') != expected_logo_src:
            logo_img_tag['src'] = expected_logo_src
            modificado = True

        # Verificar si ya está dentro de un <a> con el href correcto
        if not (logo_img_tag.parent and logo_img_tag.parent.name == 'a' and logo_img_tag.parent.get('href') == f"{root_path_prefix}index.html"):
            # Si no está envuelto o el href es incorrecto, lo volvemos a envolver
            # Primero, removemos el <a> existente si lo hay para evitar doble anidación
            if logo_img_tag.parent and logo_img_tag.parent.name == 'a':
                logo_img_tag.parent.unwrap() # Desenvuelve la imagen, dejando la imagen sola

            # Crear la nueva etiqueta <a>
            new_a_tag = soup.new_tag('a', href=f"{root_path_prefix}index.html")
            # Envolver la imagen con el nuevo enlace
            logo_img_tag.wrap(new_a_tag)
            modificado = True
        # Si ya está envuelto correctamente, no hacer nada más para el logo
    else:
        print(f"Advertencia: No se encontró el tag <img class='logo'> en '{html_filepath}'. El logo no será clickeable.")


    # 3. Corregir rutas relativas en los enlaces del menú (ul.menu-links)
    menu_links_ul = nav_tag.find('ul', class_='menu-links')
    if menu_links_ul:
        for li_tag in menu_links_ul.find_all('li'):
            a_tag = li_tag.find('a')
            if a_tag and a_tag.string: # Asegurarse de que el <a> existe y tiene texto
                link_text_lower = a_tag.string.strip().lower() # Texto del enlace (ej. "inicio")
                expected_href = None

                # Definir el href esperado según el texto del enlace
                if link_text_lower == 'inicio':
                    expected_href = f"{root_path_prefix}index.html"
                elif link_text_lower == 'fanzines':
                    expected_href = f"{root_path_prefix}fanzines.html"
                elif link_text_lower == 'videos':
                    expected_href = f"{root_path_prefix}videos.html"
                elif link_text_lower == 'contacto':
                    expected_href = f"{root_path_prefix}contacto.html"
                
                # Actualizar el href si es necesario
                if expected_href and a_tag.get('href') != expected_href:
                    a_tag['href'] = expected_href
                    modificado = True

    # Guardar el archivo si se modificó
    if modificado:
        try:
            with open(html_filepath, 'w', encoding='utf-8') as f:
                f.write(str(soup))
            print(f"Éxito: '{html_filepath}' actualizado correctamente.")
            return True
        except Exception as e:
            print(f"Error al escribir en '{html_filepath}': {e}. Saltando.")
            return False
    else:
        print(f"'{html_filepath}' ya está actualizado. No se realizaron cambios.")
        return False

def main():
    """
    Función principal para encontrar y actualizar archivos HTML.
    """
    files_to_process = []
    
    # Archivos en la carpeta raíz
    for filename in os.listdir('.'):
        if filename.endswith('.html'):
            files_to_process.append(filename)
            
    # Archivos en la subcarpeta 'fanzines/'
    if os.path.isdir('fanzines'):
        for filename in os.listdir('fanzines'):
            if filename.endswith('.html'):
                files_to_process.append(os.path.join('fanzines', filename))

    if not files_to_process:
        print("No se encontraron archivos HTML para procesar.")
        return

    print("Iniciando la actualización de enlaces del logo y menú en archivos HTML...")
    print("-----------------------------------------------------")

    updated_count = 0
    for filepath in files_to_process:
        if make_logo_clickable_and_fix_paths(filepath):
            updated_count += 1
    
    print("-----------------------------------------------------")
    print(f"Proceso completado. Se actualizaron {updated_count} de {len(files_to_process)} archivos HTML.")
    print("\n¡IMPORTANTE!: Por favor, vacía la caché de tu navegador para ver los cambios.")

if __name__ == "__main__":
    print("------------------------------------------------------------------------------------------")
    print("¡ATENCIÓN! Este script modificará tus archivos HTML directamente.")
    print("Se recomienda ENCARECIDAMENTE hacer una COPIA DE SEGURIDAD de tu carpeta del proyecto antes de ejecutarlo.")
    print("------------------------------------------------------------------------------------------\n")
    
    confirm = input("¿Has hecho una copia de seguridad y deseas continuar? (s/n): ").lower()
    if confirm == 's':
        main()
    else:
        print("Operación cancelada. Por favor, haz una copia de seguridad de tus archivos.")