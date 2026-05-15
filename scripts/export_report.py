import markdown
import os

# Define paths
input_file = r'f:\Smart Financial Manager\final year report.md'
output_file = r'f:\Smart Financial Manager\final_year_report_formatted.html'

# CSS for a professional academic look
css = """
<style>
    body {
        font-family: "Times New Roman", Times, serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 40px;
        background-color: #fff;
    }
    h1, h2, h3, h4, h5, h6 {
        color: #000;
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: bold;
    }
    h1 { border-bottom: 2px solid #000; padding-bottom: 10px; text-align: center; font-size: 24pt; }
    h2 { border-bottom: 1px solid #ccc; padding-bottom: 5px; font-size: 18pt; page-break-before: always; }
    h3 { font-size: 14pt; }
    p { margin-bottom: 16px; text-align: justify; }
    table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 20px;
        font-size: 10pt;
    }
    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }
    th {
        background-color: #f2f2f2;
        font-weight: bold;
    }
    tr:nth-child(even) { background-color: #f9f9f9; }
    blockquote {
        border-left: 5px solid #eee;
        padding-left: 20px;
        margin-left: 0;
        font-style: italic;
        color: #666;
    }
    code {
        background-color: #f4f4f4;
        padding: 2px 4px;
        border-radius: 4px;
        font-family: "Courier New", Courier, monospace;
    }
    pre {
        background-color: #f4f4f4;
        padding: 15px;
        border-radius: 4px;
        overflow-x: auto;
    }
    @media print {
        body { padding: 0; max-width: 100%; }
        h2 { page-break-before: always; }
        table { page-break-inside: auto; }
        tr { page-break-inside: avoid; page-break-after: auto; }
    }
</style>
"""

def convert_to_html():
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found.")
        return

    with open(input_file, 'r', encoding='utf-8') as f:
        text = f.read()

    # Convert markdown to html with tables extension
    html_content = markdown.markdown(text, extensions=['tables', 'fenced_code', 'toc'])

    # Wrap in basic HTML structure with professional CSS
    full_html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Final Year Project Report - Smart Financial Tracker</title>
        {css}
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(full_html)

    print(f"Success! Formatted report created at: {output_file}")
    print("You can now open this file in your browser and 'Print to PDF' for a perfect submission format.")

if __name__ == "__main__":
    convert_to_html()
