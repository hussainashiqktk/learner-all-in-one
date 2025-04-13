import os
import json

MODULES_DIR = "modules"

def extract_module_titles():
    module_titles = []
    for module_name in os.listdir(MODULES_DIR):
        module_path = os.path.join(MODULES_DIR, module_name)
        if os.path.isdir(module_path):
            python_file = os.path.join(module_path, f"{module_name}.py")
            if os.path.exists(python_file):
                try:
                    with open(python_file, 'r') as f:
                        content = f.read()
                        # Extract the title from the register() function's return value
                        start_index = content.find("return {")
                        if start_index != -1:
                            title_line_start = content.find("'title':", start_index)
                            if title_line_start != -1:
                                title_start = content.find("'", title_line_start + len("'title':")) + 1
                                title_end = content.find("'", title_start)
                                title = content[title_start:title_end]
                                module_titles.append((module_name, title))
                except Exception as e:
                    print(f"Error processing {python_file}: {e}")
    return module_titles

if __name__ == "__main__":
    titles = extract_module_titles()
    print(json.dumps(titles, indent=2))
