import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  label: string;
}

export interface TableAction {
  name: string;
  icon: string;
  color?: string;
  iconColor?: string;
  visible?: boolean;
  disabled?: boolean | ((row: any) => boolean);
}

export interface TableFilter {
  key: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'select';
  options?: Array<{ value: string | number; label: string }>;
}

export interface TableBadge {
  label: string;
  tone: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
}

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.css']
})
export class DynamicTableComponent {

  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() showActions = false;
  @Input() actions: TableAction[] = [];

  @Input() filters: TableFilter[] = [];
  @Input() total = 0;
  @Input() page = 0;
  @Input() size = 10;

  @Output() actionClick = new EventEmitter<{ action: string, row: any }>();
  @Output() filterChange = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() sizeChange = new EventEmitter<number>();

  filterValues: any = {};

  onAction(action: TableAction, row: any) {
    if (this.isActionDisabled(action, row)) {
      return;
    }

    this.actionClick.emit({ action: action.name, row });
  }

  applyFilters() {
    this.filterChange.emit({ ...this.filterValues });

    if (this.page !== 0) {
      this.pageChange.emit(0);
    }
  }

  clearFilters() {
    this.filterValues = {};
    this.filterChange.emit({});

    if (this.page !== 0) {
      this.pageChange.emit(0);
    }
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.size));
  }

  get visiblePages(): number[] {
    const current = this.page + 1;
    const start = Math.max(1, current - 1);
    const end = Math.min(this.totalPages, start + 2);
    const adjustedStart = Math.max(1, end - 2);

    return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
  }

  nextPage() {
    if (this.page + 1 < this.totalPages) {
      this.pageChange.emit(this.page + 1);
    }
  }

  prevPage() {
    if (this.page > 0) {
      this.pageChange.emit(this.page - 1);
    }
  }

  goToPage(pageNumber: number) {
    this.pageChange.emit(pageNumber - 1);
  }

  changeSize(newSize: number) {
    this.sizeChange.emit(Number(newSize));
    this.pageChange.emit(0);
  }

  isBadge(value: unknown): value is TableBadge {
    return !!value
      && typeof value === 'object'
      && 'label' in value
      && 'tone' in value;
  }

  isActionDisabled(action: TableAction, row: any): boolean {
    return typeof action.disabled === 'function'
      ? action.disabled(row)
      : !!action.disabled;
  }
}
