import docx
import os
import sys

def crear_html_desde_word(ruta_docx, nombre_salida_html):
    try:
        documento = docx.Document(ruta_docx)
    except Exception as e:
        print(f"Error: No se pudo abrir el archivo '{ruta_docx}'. Asegúrate de que el nombre y la ruta son correctos.")
        print(f"Detalle del error: {e}")
        return

    # --- Plantilla HTML ---
    html_inicio = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ediciones té de boldo</title>
    <meta name="description" content="psicoterapia institucional en córdoba argentina" />
    <link rel="stylesheet" href="../style.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap" rel="stylesheet" />
</head>
<body>
    <nav class="menu">
        <div class="contenedor">
            <img src="../logo tdb.png" alt="logo de tdb" width="120px" class="logo" />
            <ul>
                <li><a href="../index.html">inicio</a></li>
                <li><a href="../fanzines.html">fanzines</a></li>
                <li><a href="../videos.html">videos</a></li>
            </ul>
        </div>
    </nav>
    <div class="parent">
        <div class="header-container">
"""
    
    html_fin = """
            <p class="info-licencia" xmlns:cc="http://creativecommons.org/ns#">Los derechos les pertenecen a lxs autores, el pasaje de lengua tiene licencia copyleft, haga lo que quiera, cite la fuente y use la misma licencia <a href="http://creativecommons.org/licenses/by-sa/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">CC BY-SA 4.0<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1" /><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1" /><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1" /></a></p>
        </div>
        <div class="contenedor cala">
            <img src="../cala.png" alt="cala" width="100px" class="logo" />
        </div>
    </div>
</body>
</html>
"""

    contenido_html = []
    dentro_de_poema = False

    for para in documento.paragraphs:
        texto_limpio = para.text.strip()
        
        if not texto_limpio:
            continue

        if texto_limpio == '[POEMA]':
            contenido_html.append('<div class="poema">')
            dentro_de_poema = True
            continue
        elif texto_limpio == '[/POEMA]':
            contenido_html.append('</div>')
            dentro_de_poema = False
            continue

        if 'Heading 1' in para.style.name:
            contenido_html.append(f'<h1>{texto_limpio}</h1>')
        elif 'Heading 2' in para.style.name:
            contenido_html.append(f'<h2>{texto_limpio}</h2>')
        elif texto_limpio.startswith('---'):
            contenido_html.append(f'<p class="cita-bloque">{texto_limpio[3:].strip()}</p>')
        elif texto_limpio.startswith('-'):
            contenido_html.append(f'<p class="cita-sangrada">{texto_limpio[1:].strip()}</p>')
        elif dentro_de_poema:
            contenido_html.append(f'<p>{texto_limpio}</p>')
        else:
            contenido_html.append(f'<p>{texto_limpio}</p>')

    html_completo = html_inicio + '\n'.join(contenido_html) + html_fin

    # Guardar el nuevo archivo HTML en la carpeta 'fanzines'
    ruta_salida = os.path.join('fanzines', nombre_salida_html)
    with open(ruta_salida, 'w', encoding='utf-8') as f:
        f.write(html_completo)
    
    print(f"¡Éxito! Se ha creado el archivo '{ruta_salida}'.")


# --- Cómo ejecutar el script ---
if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Error: Uso incorrecto.")
        print('Ejemplo: python convertir_a_html.py "mi_documento.docx" "salida.html"')
    else:
        archivo_word = sys.argv[1]
        archivo_html_salida = sys.argv[2]
        crear_html_desde_word(archivo_word, archivo_html_salida)