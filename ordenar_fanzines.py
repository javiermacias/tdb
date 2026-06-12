import os
from bs4 import BeautifulSoup

def ordenar_fanzines_html(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            html_content = f.read()
    except FileNotFoundError:
        print(f"Error: Archivo no encontrado en '{filepath}'.")
        return False

    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Encontrar la lista de fanzines
    fanzine_list_ul = soup.find('ul', class_='fanzine-link-list')
    
    if not fanzine_list_ul:
        print("No se encontró la lista de fanzines (<ul class='fanzine-link-list'>).")
        return False

    # Obtener todos los elementos <li>
    li_elements = fanzine_list_ul.find_all('li', class_='fanzine-link')
    
    # Función para obtener el autor (subtítulo) de un <li> y usarlo como llave para ordenar
    def obtener_autor(li):
        subtitle_tag = li.find('span', class_='fanzine-subtitle')
        if subtitle_tag and subtitle_tag.get_text(strip=True):
            autor = subtitle_tag.get_text(strip=True).lower()
            
            # Agrupamos a los autores principales para que queden juntos y al principio
            if 'deligny' in autor:
                return '0_deligny_' + autor
            elif 'oury' in autor:
                return '0_oury_' + autor
            elif 'tosquelles' in autor:
                return '0_tosquelles_' + autor
            
            return '1_' + autor
        return "2_"

    # Ordenar los elementos <li> basados en el texto completo del autor
    li_elements_sorted = sorted(li_elements, key=obtener_autor)

    # Limpiar la lista actual
    fanzine_list_ul.clear()

    # Añadir los elementos ordenados, junto con saltos de línea para mantener el formato legible
    for li in li_elements_sorted:
        fanzine_list_ul.append('\n    ')
        fanzine_list_ul.append(li)
    fanzine_list_ul.append('\n  ')

    # Sobrescribir el archivo fanzines.html con la nueva estructura
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(str(soup))
        
    print(f"¡Fanzines ordenados por autor exitosamente en '{filepath}'!")

if __name__ == "__main__":
    ordenar_fanzines_html('fanzines.html')