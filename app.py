from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import importlib.util

app = Flask(__name__)

PLUGIN_DIR = "modules"

def load_plugins():
    plugins = {}
    plugin_path = os.path.join(os.path.dirname(__file__), PLUGIN_DIR)
    
    if not os.path.exists(plugin_path):
        os.makedirs(plugin_path)
    
    for folder in os.listdir(plugin_path):
        if os.path.isdir(os.path.join(plugin_path, folder)):
            py_file = os.path.join(plugin_path, folder, f"{folder}.py")
            if os.path.exists(py_file):
                try:
                    spec = importlib.util.spec_from_file_location(folder, py_file)
                    module = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(module)
                    if hasattr(module, 'register'):
                        plugins[folder] = module.register()
                except Exception as e:
                    print(f"Error loading plugin {folder}: {str(e)}")
    
    return plugins

plugins = load_plugins()

def extract_module_titles():
    module_titles = []
    for module_name, plugin in plugins.items():
        module_titles.append((module_name, plugin['title']))
    return module_titles

module_titles = extract_module_titles()

@app.route('/')
def home():
    return render_template('home.html', plugins=plugins, modules=module_titles)

@app.route('/plugin/<plugin_name>', methods=['GET', 'POST'])
def plugin_page(plugin_name):
    if plugin_name not in plugins:
        return "Plugin not found", 404
    
    if request.method == 'POST':
        return plugins[plugin_name]['handle_post'](request)
    
    return render_template('base.html', plugin_name=plugin_name, modules=module_titles)

# Add this new route to serve JS files from module directories
@app.route('/module_assets/<module_name>/<path:filename>')
def module_assets(module_name, filename):
    module_dir = os.path.join(PLUGIN_DIR, module_name)
    return send_from_directory(module_dir, filename)

if __name__ == '__main__':
    app.run(debug=True)
