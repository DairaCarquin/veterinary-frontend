import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { DynamicTableComponent, TableAction, TableColumn } from '../../../../componets/dynamic-table/dynamic-table.component';
import { MedicalHistoryService } from '../../../../service/medical-history.service';

@Component({
  standalone: true,
  selector: 'app-medical-events',
  imports: [CommonModule, FormsModule, DynamicTableComponent, MatIcon],
  templateUrl: './medical-events.component.html',
  styleUrls: ['./medical-events.component.css']
})
export class MedicalEventsComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private service: MedicalHistoryService
  ) { }

  caseId!: number;
  type!: string;

  data: any[] = [];
  page = 0;
  size = 10;
  total = 0;

  showCreateModal = false;
  showEditModal = false;
  selectedItem: any = null;

  columns: TableColumn[] = [];
  actions: TableAction[] = [
    { name: 'edit', icon: 'edit', color: '#dbeafe', iconColor: '#2563eb' }
  ];

  readonly eventMeta: Record<string, { title: string; subtitle: string; accent: string }> = {
    analysis: {
      title: 'Analisis',
      subtitle: 'Organiza hallazgos, resultados y notas de seguimiento del caso.',
      accent: 'accent-analysis'
    },
    diagnosis: {
      title: 'Diagnostico',
      subtitle: 'Documenta la interpretacion clinica con observaciones claras.',
      accent: 'accent-diagnosis'
    },
    referral: {
      title: 'Referido',
      subtitle: 'Registra derivaciones, motivos y destino del paciente.',
      accent: 'accent-referral'
    },
    treatment: {
      title: 'Tratamiento',
      subtitle: 'Define planes terapeuticos e indicaciones de forma ordenada.',
      accent: 'accent-treatment'
    }
  };

  ngOnInit() {
    this.caseId = Number(this.route.snapshot.paramMap.get('id'));
    this.type = this.route.snapshot.paramMap.get('type')!;
    this.configureTable();
    this.loadData();
  }

  configureTable() {

    if (this.type === 'analysis') {
      this.columns = [
        { key: 'id', label: 'ID' },
        { key: 'description', label: 'Descripción' },
        { key: 'result', label: 'Resultado' },
        { key: 'createdAt', label: 'Fecha' }
      ];
    }

    if (this.type === 'diagnosis') {
      this.columns = [
        { key: 'id', label: 'ID' },
        { key: 'diagnosis', label: 'Diagnóstico' },
        { key: 'observations', label: 'Observaciones' },
        { key: 'createdAt', label: 'Fecha' }
      ];
    }

    if (this.type === 'referral') {
      this.columns = [
        { key: 'id', label: 'ID' },
        { key: 'referredTo', label: 'Referido a' },
        { key: 'reason', label: 'Motivo' },
        { key: 'createdAt', label: 'Fecha' }
      ];
    }

    if (this.type === 'treatment') {
      this.columns = [
        { key: 'id', label: 'ID' },
        { key: 'treatment', label: 'Tratamiento' },
        { key: 'indications', label: 'Indicaciones' },
        { key: 'createdAt', label: 'Fecha' }
      ];
    }
  }

  loadData() {
    const methodMap: any = {
      analysis: this.service.getAnalysis.bind(this.service),
      diagnosis: this.service.getDiagnosis.bind(this.service),
      referral: this.service.getReferral.bind(this.service),
      treatment: this.service.getTreatment.bind(this.service)
    };

    methodMap[this.type](this.caseId, undefined, undefined, this.page, this.size)
      .subscribe((res: any) => {
        this.data = res.data;
        this.total = res.total;
      });
  }

  handleAction(event: any) {
    if (event.action === 'edit') {
      this.selectedItem = { ...event.row };
      this.showEditModal = true;
    }
  }

  openCreateModal() {
    this.selectedItem = { medicalCaseId: this.caseId };
    this.showCreateModal = true;
  }

  closeModals() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.selectedItem = null;
  }

  save() {
    const createMap: any = {
      analysis: this.service.createAnalysis.bind(this.service),
      diagnosis: this.service.createDiagnosis.bind(this.service),
      referral: this.service.createReferral.bind(this.service),
      treatment: this.service.createTreatment.bind(this.service)
    };

    const updateMap: any = {
      analysis: this.service.updateAnalysis.bind(this.service),
      diagnosis: this.service.updateDiagnosis.bind(this.service),
      referral: this.service.updateReferral.bind(this.service),
      treatment: this.service.updateTreatment.bind(this.service)
    };

    if (this.selectedItem.id) {
      updateMap[this.type](this.selectedItem.id, this.selectedItem)
        .subscribe(() => { this.closeModals(); this.loadData(); });
    } else {
      createMap[this.type](this.selectedItem)
        .subscribe(() => { this.closeModals(); this.loadData(); });
    }
  }

  get currentMeta() {
    return this.eventMeta[this.type] ?? {
      title: 'Detalle',
      subtitle: 'Gestiona la informacion relacionada con este caso.',
      accent: 'accent-analysis'
    };
  }

  get visibleColumns(): TableColumn[] {
    return this.columns.filter(col => col.key !== 'id' && col.key !== 'createdAt');
  }

  getModalTitle(): string {
    return `${this.selectedItem?.id ? 'Actualizar' : 'Crear'} ${this.currentMeta.title}`;
  }

  getFieldPlaceholder(key: string): string {
    const placeholders: Record<string, string> = {
      description: 'Describe el analisis realizado',
      result: 'Resume el resultado obtenido',
      diagnosis: 'Ingresa el diagnostico',
      observations: 'Anota observaciones clinicas',
      referredTo: 'Especialista o centro de destino',
      reason: 'Motivo del referido',
      treatment: 'Describe el tratamiento',
      indications: 'Indica pauta, dosis o recomendaciones'
    };

    return placeholders[key] ?? 'Completa este campo';
  }
}
