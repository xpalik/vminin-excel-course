import {ExcelComponent} from '@core/ExcelComponent';
import {$} from '@core/dom'
import {createTable} from '@/components/table/table.template';
import {resizeHandler} from '@/components/table/table.resize.js'
import {matrix, shouldResize, nextSelector} from './table.functions';
import {isCell} from '@/components/table/table.functions';
import {TableSelection} from '@/components/table/TableSelection';

export class Table extends ExcelComponent {
    static className = 'excel__table'
    constructor($root, options) {
        super($root, {
            name: 'Table',
            listeners: ['mousedown', 'keydown', 'input'],
            ...options
        });
    }
    toHTML() {
        return createTable(8)
    }
    prepare() {
        this.selection = new TableSelection()
    }

    init() {
        super.init()
        const $cell = this.$root.find('[data-id="0:0"]')
        this.selection.select($cell)

        this.$on('formula:input', text => {
            this.selection.current.text(text)
        })
        this.$on('formula:done', () => {
            this.selection.current.focus()
        })
        this.selectCell($cell)
    }
    selectCell($cell) {
        this.$emit('table:select', $cell)
    }
    onMousedown(event) {
        if (shouldResize(event)) {
            resizeHandler(this.$root, event)
        } else if (isCell(event)) {
            const $target = $(event.target)
            if (event.shiftKey) {
                const $cells = matrix($target, this.selection.current).map(id =>
                    this.$root.find(`[data-id="${id}"]`))
                this.selection.selectGroup($cells)
            } else {
                this.selection.select($target)
            }
        }
    }
    onKeydown(event) {
        const keys = [
            'Enter',
            'Tab',
            'ArrowDown',
            'ArrowUp',
            'ArrowLeft',
            'ArrowRight'
        ]
        const {key} = event
        if (keys.includes(key) && !event.shiftKey) {
            event.preventDefault()
            const id = this.selection.current.id(true)
            const $next = this.$root.find(nextSelector(key, id));
            this.selection.select($next)
            this.selectCell($next)
        }
    }
    onInput(event) {
        this.$emit('table:input', $(event.target))
    }
}
