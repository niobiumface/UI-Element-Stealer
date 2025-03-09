document.addEventListener('DOMContentLoaded', () => {
    loadElements();
    loadCategories();
    
    document.getElementById('search-input').addEventListener('input', filterElements);
    document.getElementById('category-filter').addEventListener('change', filterElements);
    document.getElementById('new-category-btn').addEventListener('click', createNewCategory);
    document.getElementById('manage-categories-btn').addEventListener('click', openCategoriesPage);
    document.getElementById('export-btn').addEventListener('click', exportElements);
    document.getElementById('import-btn').addEventListener('click', importElements);
  });
  
  function loadElements() {
    chrome.storage.local.get({ elements: [] }, (data) => {
      const elementsContainer = document.getElementById('elements-container');
      const emptyState = document.getElementById('empty-state');
      
      if (data.elements.length === 0) {
        elementsContainer.innerHTML = '';
        emptyState.style.display = 'block';
        return;
      }
      
      emptyState.style.display = 'none';
      renderElements(data.elements);
    });
  }
  
  function renderElements(elements) {
    const elementsContainer = document.getElementById('elements-container');
    elementsContainer.innerHTML = '';
    
    elements.forEach(element => {
      const card = document.createElement('div');
      card.className = 'element-card';
      card.dataset.id = element.id;
      card.dataset.category = element.category;
      
      card.innerHTML = `
        <div class="element-header">
          <div class="element-title">${element.name}</div>
          <div class="element-category">${element.category}</div>
          <button class="edit-btn" title="Edit">✏️</button>
        </div>
        <div class="element-preview">
          <!-- Preview will be populated by applying styles -->
        </div>
        <div class="element-actions">
          <button class="copy-html-btn">Copy HTML</button>
          <button class="copy-css-btn">Copy CSS</button>
          <button class="view-css-btn">View CSS</button>
          <button class="delete-btn">Delete</button>
        </div>
        <div class="element-css-code" style="display: none;">
          <pre>${convertStylesToCSS(element.styles, element.tagName)}</pre>
          <button class="close-css-btn">Close</button>
        </div>
      `;
      
      elementsContainer.appendChild(card);
      
      // Create preview
      const preview = card.querySelector('.element-preview');
      try {
        // Create a safe version of the element for preview
        const wrapper = document.createElement('div');
        wrapper.innerHTML = element.outerHTML;
        const previewElement = wrapper.firstChild;
        
        // Apply saved styles
        Object.keys(element.styles).forEach(prop => {
          previewElement.style[prop] = element.styles[prop];
        });
        
        // Modify the element to fit in preview
        previewElement.style.position = 'static';
        previewElement.style.maxWidth = '100%';
        previewElement.style.margin = '0';
        previewElement.style.cursor = 'default';
        
        // Remove event handlers
        previewElement.onclick = null;
        previewElement.onmouseover = null;
        
        preview.appendChild(previewElement);
      } catch (e) {
        preview.textContent = 'Preview not available';
      }
      
      // Add event listeners
      card.querySelector('.copy-html-btn').addEventListener('click', () => {
        copyToClipboard(element.outerHTML, 'HTML copied to clipboard!');
      });
      
      card.querySelector('.copy-css-btn').addEventListener('click', () => {
        const cssText = convertStylesToCSS(element.styles, element.tagName);
        copyToClipboard(cssText, 'CSS copied to clipboard!');
      });
      
      card.querySelector('.delete-btn').addEventListener('click', () => {
        deleteElement(element.id);
      });
      
      // Add event listener for edit button
      card.querySelector('.edit-btn').addEventListener('click', () => {
        showEditDialog(element);
      });
      
      // Add event listener for view CSS button
      card.querySelector('.view-css-btn').addEventListener('click', () => {
        const cssCodeElement = card.querySelector('.element-css-code');
        cssCodeElement.style.display = 'block';
      });
      
      // Add event listener for close CSS button
      card.querySelector('.close-css-btn').addEventListener('click', () => {
        const cssCodeElement = card.querySelector('.element-css-code');
        cssCodeElement.style.display = 'none';
      });
    });
  }
  
  function convertStylesToCSS(styles, tagName) {
    let cssText = `${tagName.toLowerCase()} {\n`;
    
    Object.keys(styles).forEach(prop => {
      if (styles[prop] && styles[prop] !== 'initial' && styles[prop] !== 'none') {
        cssText += `  ${prop}: ${styles[prop]};\n`;
      }
    });
    
    cssText += '}';
    return cssText;
  }
  
  function copyToClipboard(text, successMessage) {
    navigator.clipboard.writeText(text).then(() => {
      showNotification(successMessage);
    });
  }
  
  function showNotification(message) {
    // Check if notification exists
    let notification = document.querySelector('.notification');
    
    if (!notification) {
      notification = document.createElement('div');
      notification.className = 'notification';
      document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 2000);
  }
  
  function deleteElement(id) {
    chrome.storage.local.get({ elements: [] }, (data) => {
      const elements = data.elements.filter(element => element.id !== id);
      chrome.storage.local.set({ elements }, () => {
        loadElements();
      });
    });
  }
  
  function loadCategories() {
    chrome.storage.local.get({ categories: ["Default"] }, (data) => {
      const categoryFilter = document.getElementById('category-filter');
      categoryFilter.innerHTML = '<option value="all">All Categories</option>';
      
      data.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
      });
    });
  }
  
  function filterElements() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    
    chrome.storage.local.get({ elements: [] }, (data) => {
      let filteredElements = data.elements;
      
      // Filter by search text
      if (searchInput) {
        filteredElements = filteredElements.filter(element => 
          element.name.toLowerCase().includes(searchInput)
        );
      }
      
      // Filter by category
      if (categoryFilter !== 'all') {
        filteredElements = filteredElements.filter(element => 
          element.category === categoryFilter
        );
      }
      
      renderElements(filteredElements);
    });
  }
  
  function createNewCategory() {
    const categoryName = prompt('Enter new category name:');
    
    if (!categoryName) return;
    
    chrome.storage.local.get({ categories: ["Default"] }, (data) => {
      const categories = data.categories;
      
      if (!categories.includes(categoryName)) {
        categories.push(categoryName);
        chrome.storage.local.set({ categories }, () => {
          loadCategories();
        });
      } else {
        alert('Category already exists!');
      }
    });
  }
  
  function exportElements() {
    chrome.storage.local.get({ elements: [], categories: ["Default"] }, (data) => {
      const exportData = {
        elements: data.elements,
        categories: data.categories
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ui-elements-export.json';
      a.click();
      
      URL.revokeObjectURL(url);
    });
  }
  
  function importElements() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
      const file = e.target.files[0];
      
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = readerEvent => {
        try {
          const content = JSON.parse(readerEvent.target.result);
          
          if (!content.elements || !content.categories) {
            throw new Error('Invalid import file format');
          }
          
          chrome.storage.local.set({ 
            elements: content.elements,
            categories: content.categories
          }, () => {
            loadElements();
            loadCategories();
            showNotification('Import successful!');
          });
        } catch (error) {
          showNotification('Error importing file: ' + error.message);
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  }
  
  function showEditDialog(element) {
    // Create modal dialog
    const dialog = document.createElement('div');
    dialog.className = 'edit-dialog';
    
    chrome.storage.local.get({ categories: ["Default"] }, (data) => {
      let categoriesHTML = '';
      data.categories.forEach(category => {
        const selected = category === element.category ? 'selected' : '';
        categoriesHTML += `<option value="${category}" ${selected}>${category}</option>`;
      });
      
      dialog.innerHTML = `
        <div class="dialog-content">
          <h3>Edit Element</h3>
          <div class="form-group">
            <label for="edit-element-name">Name:</label>
            <input type="text" id="edit-element-name" value="${element.name}">
          </div>
          <div class="form-group">
            <label for="edit-element-category">Category:</label>
            <select id="edit-element-category">
              ${categoriesHTML}
            </select>
          </div>
          <div class="form-group">
            <input type="text" id="edit-new-category" placeholder="Or create new category">
          </div>
          <div class="button-group">
            <button id="save-edit-button">Save</button>
            <button id="cancel-edit-button">Cancel</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(dialog);
      
      document.getElementById('save-edit-button').addEventListener('click', () => {
        const name = document.getElementById('edit-element-name').value || element.name;
        let category = document.getElementById('edit-element-category').value;
        const newCategory = document.getElementById('edit-new-category').value;
        
        if (newCategory) {
          category = newCategory;
          // Save new category
          chrome.storage.local.get({ categories: ["Default"] }, (data) => {
            const categories = data.categories;
            if (!categories.includes(newCategory)) {
              categories.push(newCategory);
              chrome.storage.local.set({ categories });
            }
          });
        }
        
        updateElement(element.id, { name, category });
        document.body.removeChild(dialog);
      });
      
      document.getElementById('cancel-edit-button').addEventListener('click', () => {
        document.body.removeChild(dialog);
      });
    });
  }
  
  function updateElement(id, updates) {
    chrome.storage.local.get({ elements: [] }, (data) => {
      const elements = data.elements.map(element => {
        if (element.id === id) {
          return { ...element, ...updates };
        }
        return element;
      });
      
      chrome.storage.local.set({ elements }, () => {
        loadElements();
        loadCategories();
        showNotification('Element updated successfully!');
      });
    });
  }
  
  function openCategoriesPage() {
    chrome.tabs.create({ url: 'categories.html' });
  }
