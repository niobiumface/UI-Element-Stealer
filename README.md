# UI Element Stealer Chrome Extension

A Chrome extension that allows you to "steal" buttons and other UI elements from websites along with their exact CSS styling.

## Features

- **Element Stealing**: Right-click on any webpage element and select "Steal Element" to capture it with all its CSS styles.
- **Element Preview**: See a live preview of the captured elements in your library.
- **Category Management**: Organize your elements into custom categories for better organization.
- **Search & Filter**: Easily find elements by name or filter by category.
- **Export & Import**: Share your element collection or back it up by exporting/importing.
- **Copy HTML & CSS**: Quickly copy the HTML or CSS of any saved element to use in your own projects.

## How to Use

1. **Install the Extension**:
   - Load the extension in Chrome by going to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select this directory

2. **Capture Elements**:
   - Navigate to any website
   - Right-click on a button or UI element you want to capture
   - Select "Steal Element" from the context menu
   - Click on the element to capture it
   - Enter a name and select a category for the element
   - Click "Save"

3. **Manage Your Collection**:
   - Click the extension icon to open the popup
   - View, search, and filter your saved elements
   - Create new categories or manage existing ones
   - Export your collection for backup or sharing

## Element Management

- **View CSS**: Click "View CSS" to see the complete CSS styles of the element
- **Copy HTML/CSS**: Use the copy buttons to get the HTML or CSS code
- **Edit Elements**: Click the edit button to rename elements or change their category
- **Delete Elements**: Remove elements you no longer need

## Category Management

- **Create Categories**: Create new categories from the popup or when saving elements
- **Manage Categories**: Use the "Manage Categories" button to rename or delete categories
- **Filter by Category**: Use the dropdown to filter elements by category

## Development

This extension is built using:
- HTML, CSS, and JavaScript
- Chrome Extension APIs
- Local storage for saving elements and categories

## License

This project is open source and available for anyone to use and modify.
