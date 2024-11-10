class ColumnWidthManager {
    constructor(tableId) {
        this.tableId = tableId;
        this.storageKey = `${tableId}_column_widths`;
        this.columns = document.querySelectorAll(`#${tableId} th`);
        this.isResizing = false;
        this.currentColumn = null;
        this.startX = null;
        this.startWidth = null;
        this.initResizers();
        this.loadWidths();
    }

    initResizers() {
        this.columns.forEach(column => {
            const resizer = document.createElement('div');
            resizer.className = 'resizer';
            column.appendChild(resizer);
            this.createResizableColumn(column, resizer);
        });
    }

    createResizableColumn(column, resizer) {
        resizer.addEventListener('mousedown', e => {
            this.startX = e.pageX;
            this.startWidth = column.offsetWidth;
            this.isResizing = true;
            this.currentColumn = column;
            
            document.addEventListener('mousemove', this.handleMouseMove);
            document.addEventListener('mouseup', this.handleMouseUp);
            
            document.body.classList.add('resizing');
        });
    }

    handleMouseMove = (e) => {
        if (this.isResizing && this.startWidth !== null) {
            const width = this.startWidth + (e.pageX - this.startX);
            if (width > 50) { // Minimum width
                this.currentColumn.style.width = `${width}px`;
            }
        }
    }

    handleMouseUp = () => {
        if (this.isResizing) {
            this.isResizing = false;
            this.startX = null;
            this.startWidth = null;
            document.body.classList.remove('resizing');
            document.removeEventListener('mousemove', this.handleMouseMove);
            document.removeEventListener('mouseup', this.handleMouseUp);
            this.saveWidths();
        }
    }

    saveWidths() {
        const widths = {};
        this.columns.forEach(column => {
            widths[column.className] = column.offsetWidth;
        });
        localStorage.setItem(this.storageKey, JSON.stringify(widths));
    }

    loadWidths() {
        const savedWidths = localStorage.getItem(this.storageKey);
        if (savedWidths) {
            const widths = JSON.parse(savedWidths);
            this.columns.forEach(column => {
                if (widths[column.className]) {
                    column.style.width = `${widths[column.className]}px`;
                }
            });
        }
    }
} 