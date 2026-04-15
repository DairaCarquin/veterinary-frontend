import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface SearchableSelectOption {
  id: number;
  label: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

@Component({
  selector: 'app-searchable-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './searchable-select.component.html',
  styleUrls: ['./searchable-select.component.css']
})
export class SearchableSelectComponent implements OnChanges {
  @Input() placeholder = 'Buscar...';
  @Input() emptyMessage = 'No se encontraron resultados';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() invalid = false;
  @Input() selectedLabel = '';
  @Input() options: SearchableSelectOption[] = [];

  @Output() searchChange = new EventEmitter<string>();
  @Output() optionSelected = new EventEmitter<SearchableSelectOption>();
  @Output() selectionCleared = new EventEmitter<void>();

  isOpen = false;
  searchTerm = '';
  private debounceHandle?: ReturnType<typeof setTimeout>;
  private suppressClearEvent = false;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedLabel'] && !this.isOpen) {
      this.searchTerm = this.selectedLabel || '';
    }
  }

  openDropdown(): void {
    if (this.disabled) {
      return;
    }

    this.isOpen = true;
    this.emitSearch(this.searchTerm);
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value;
    this.isOpen = true;

    if (!this.suppressClearEvent && value !== this.selectedLabel) {
      this.selectionCleared.emit();
    }

    this.suppressClearEvent = false;

    if (this.debounceHandle) {
      clearTimeout(this.debounceHandle);
    }

    this.debounceHandle = setTimeout(() => {
      this.emitSearch(value);
    }, 250);
  }

  selectOption(option: SearchableSelectOption): void {
    this.suppressClearEvent = true;
    this.searchTerm = option.label;
    this.isOpen = false;
    this.optionSelected.emit(option);
  }

  trackByOption(_: number, option: SearchableSelectOption): number {
    return option.id;
  }

  private emitSearch(value: string): void {
    this.searchChange.emit(value.trim());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isOpen = false;
      this.searchTerm = this.selectedLabel || this.searchTerm;
    }
  }
}
