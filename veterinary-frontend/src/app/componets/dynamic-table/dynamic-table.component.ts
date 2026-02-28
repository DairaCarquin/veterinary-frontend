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
}

export interface TableFilter {
  key: string;
  label: string;
  placeholder?: string;
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
  @Input() showActions: boolean = false;
  @Input() actions: TableAction[] = [];

  @Input() filters: TableFilter[] = [];
  @Input() total: number = 0;
  @Input() page: number = 0;
  @Input() size: number = 10;

  @Output() actionClick = new EventEmitter<{ action: string, row: any }>();
  @Output() filterChange = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() sizeChange = new EventEmitter<number>();

  filterValues: any = {};

  onAction(action: string, row: any) {
    this.actionClick.emit({ action, row });
  }

  applyFilters() {
    this.pageChange.emit(0);
    this.filterChange.emit(this.filterValues);
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.size);
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

  changeSize(newSize: number) {
    this.sizeChange.emit(Number(newSize));
    this.pageChange.emit(0);
  }

}
