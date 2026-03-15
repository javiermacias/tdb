import docx
import os
import sys
import re

def crear_html_desde_word(ruta_docx, nombre_salida_html):
    try:
        documento = docx.Document(ruta_docx)
    except Exception as e:
        print(f"Error: No se pudo abrir '{ruta_docx}'. {e}")
        return

    # --- 1. Extracción de Notas al Pie (Back-end) ---
    notas_dict = {}
    try:
        # Accedemos al XML de las notas para extraer el texto y el ID
        footnotes_part = documento.part.related_parts
        for rel in footnotes_part:
            if "footnotes" in footnotes_part[rel].partname:
                import lxml.etree as etree
                xml_tree = etree.fromstring(footnotes_part[rel]._blob)
                ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
                for fn in xml_tree.xpath('//w:footnote', namespaces=ns):
                    id_nota = fn.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}id')
                    if int(id_nota) > 0:
                        texto = "".join(fn.xpath('.//w:t/text()', namespaces=ns))
                        notas_dict[id_nota] = texto
    except:
        pass

    # --- 2. Tu Plantilla HTML (Sin cambios en tus rutas) ---
    html_inicio = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <title>Ediciones té de boldo</title>
    <link rel="stylesheet" href="../style.css" />
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap" rel="stylesheet" />
    <style>
        /* Estilos mínimos para que las notas funcionen */
        .nota-ref {{ vertical-align: super; font-size: 0.75em; text-decoration: none; padding: 0 2px; }}
        .seccion-notas {{ margin-top: 4em; border-top: 1px solid #444; padding-top: 1em; font-size: 0.9em; }}
        .backlink {{ text-decoration: none; margin-left: 8px; }}
    </style>
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
    <div class="parent"><div class="header-container">
"""

    contenido_html = []
    dentro_de_poema = False

    # --- 3. Procesamiento de Párrafos ---
    for para in documento.paragraphs:
        # Procesamos el contenido del párrafo (Itálicas y Negritas)
        p_html_interno = ""
        for run in para.runs:
            texto_run = run.text
            if run.italic: texto_run = f"<em>{texto_run}</em>"
            if run.bold: texto_run = f"<strong>{texto_run}</strong>"
            p_html_interno += texto_run

        # Insertar llamadas a notas al pie [n]
        fn_refs = re.findall(r'w:footnoteReference w:id="(\d+)"', para._p.xml)
        for fid in fn_refs:
            p_html_interno += f'<a href="#fn{fid}" id="ref{fid}" class="nota-ref">[{fid}]</a>'

        texto_plano = para.text.strip()
        if not texto_plano: continue

        # Tu lógica original de estilos
        if texto_plano == '[POEMA]':
            contenido_html.append('<div class="poema">')
            dentro_de_poema = True
        elif texto_plano == '[/POEMA]':
            contenido_html.append('</div>')
            dentro_de_poema = False
        elif 'Heading 1' in para.style.name:
            contenido_html.append(f'<h1>{p_html_interno}</h1>')
        elif 'Heading 2' in para.style.name:
            contenido_html.append(f'<h2>{p_html_interno}</h2>')
        elif texto_plano.startswith('---'):
            contenido_html.append(f'<p class="cita-bloque">{p_html_interno.replace("---", "").strip()}</p>')
        elif texto_plano.startswith('-'):
            contenido_html.append(f'<p class="cita-sangrada">{p_html_interno.replace("-", "", 1).strip()}</p>')
        else:
            contenido_html.append(f'<p>{p_html_interno}</p>')

    # --- 4. El fondo de la página (Notas) ---
    if notas_dict:
        contenido_html.append('<div class="seccion-notas"><h3>Notas</h3>')
        for fid, ftexto in notas_dict.items():
            contenido_html.append(f'<p id="fn{fid}">{fid}. {ftexto} <a href="#ref{fid}" class="backlink">↩</a></p>')
        contenido_html.append('</div>')

    # --- 5. Cierre ---
    html_fin = """
        </div>
        <div class="contenedor cala">
            <img src="../cala.png" alt="cala" width="100px" class="logo" />
        </div>
    </div>
</body>
</html>
"""
    
    # Guardar
    if not os.path.exists('fanzines'): os.makedirs('fanzines')
    ruta_salida = os.path.join('fanzines', nombre_salida_html)
    with open(ruta_salida, 'w', encoding='utf-8') as f:
        f.write(html_inicio + '\n'.join(contenido_html) + html_fin)
    
    print(f"Archivo generado: {ruta_salida}")

if __name__ == "__main__":
    if len(sys.argv) == 3:
        crear_html_desde_word(sys.argv[1], sys.argv[2])
