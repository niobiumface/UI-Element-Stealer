let isSelecting = false;
let hoveredElement = null;
let overlay = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startSelection") {
    startElementSelection();
  }
  return true;
});

function startElementSelection() {
  isSelecting = true;
  
  // Create overlay with instructions and info box
  overlay = document.createElement('div');
  overlay.id = 'element-stealer-overlay';
  overlay.innerHTML = `
    <div class="element-stealer-message">Click on an element to steal it</div>
    <div class="element-stealer-info"></div>
  `;
  document.body.appendChild(overlay);
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('click', handleElementClick);
  document.addEventListener('keydown', handleKeyDown);
}

function handleMouseMove(e) {
  if (!isSelecting) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  const element = document.elementFromPoint(e.clientX, e.clientY);
  
  if (element && element !== overlay && !overlay.contains(element)) {
    if (hoveredElement) {
      hoveredElement.classList.remove('element-stealer-highlight');
    }
    
    hoveredElement = element;
    hoveredElement.classList.add('element-stealer-highlight');
    
    // Update overlay with element info
    const computedStyle = window.getComputedStyle(element);
    const infoBox = overlay.querySelector('.element-stealer-info');
    if (infoBox) {
      infoBox.innerHTML = `
        <div><strong>Tag:</strong> ${element.tagName.toLowerCase()}</div>
        <div><strong>Class:</strong> ${element.className || 'none'}</div>
        <div><strong>ID:</strong> ${element.id || 'none'}</div>
        <div><strong>Size:</strong> ${Math.round(element.offsetWidth)}×${Math.round(element.offsetHeight)}</div>
      `;
    }
  }
}

function handleElementClick(e) {
  if (!isSelecting) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  if (hoveredElement) {
    captureElement(hoveredElement);
  }
  
  stopElementSelection();
}

function handleKeyDown(e) {
  if (e.key === 'Escape' && isSelecting) {
    stopElementSelection();
  }
}

function stopElementSelection() {
  isSelecting = false;
  
  if (hoveredElement) {
    hoveredElement.classList.remove('element-stealer-highlight');
    hoveredElement = null;
  }
  
  if (overlay) {
    document.body.removeChild(overlay);
    overlay = null;
  }
  
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('click', handleElementClick);
  document.removeEventListener('keydown', handleKeyDown);
}

function captureElement(element) {
  // Get all applied styles
  const computedStyle = window.getComputedStyle(element);
  const styles = {};
  
  for (let i = 0; i < computedStyle.length; i++) {
    const prop = computedStyle[i];
    styles[prop] = computedStyle.getPropertyValue(prop);
  }
  
  // Show category selection dialog
  showCategoryDialog(element, styles);
}

function showCategoryDialog(element, styles) {
  const dialog = document.createElement('div');
  dialog.className = 'element-stealer-dialog';
  
  chrome.storage.local.get({ categories: ["Default"] }, (data) => {
    let categoriesHTML = '';
    data.categories.forEach(category => {
      categoriesHTML += `<option value="${category}">${category}</option>`;
    });
    
    dialog.innerHTML = `
      <div class="dialog-content">
        <h3>Save Element</h3>
        <div class="form-group">
          <label for="element-name">Name:</label>
          <input type="text" id="element-name" placeholder="Button Name">
        </div>
        <div class="form-group">
          <label for="element-category">Category:</label>
          <select id="element-category">
            ${categoriesHTML}
          </select>
        </div>
        <div class="form-group">
          <input type="text" id="new-category" placeholder="Or create new category">
        </div>
        <div class="button-group">
          <button id="save-button">Save</button>
          <button id="cancel-button">Cancel</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    document.getElementById('save-button').addEventListener('click', () => {
      const name = document.getElementById('element-name').value || 'Unnamed Element';
      let category = document.getElementById('element-category').value;
      const newCategory = document.getElementById('new-category').value;
      
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
      
      saveElement(element, styles, name, category);
      document.body.removeChild(dialog);
    });
    
    document.getElementById('cancel-button').addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
  });
}

function saveElement(element, styles, name, category) {
  const elementData = {
    name: name,
    category: category,
    tagName: element.tagName.toLowerCase(),
    innerHTML: element.innerHTML,
    outerHTML: element.outerHTML,
    styles: styles,
    timestamp: Date.now()
  };
  
  chrome.runtime.sendMessage(
    { action: "saveElement", element: elementData },
    (response) => {
      if (response && response.success) {
        showNotification('Element saved successfully!');
      }
    }
  );
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'element-stealer-notification';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  }, 10);
}
