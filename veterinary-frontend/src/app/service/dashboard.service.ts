import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  getKpis() {
    return {
      revenue: 12450,
      appointments: 182,
      pets: 143,
      newClients: 37
    };
  }

  getWeeklyRevenue() {
    return [
      { day: 'Lun', online: 1200, presencial: 900 },
      { day: 'Mar', online: 1500, presencial: 1100 },
      { day: 'Mié', online: 900, presencial: 1800 },
      { day: 'Jue', online: 1400, presencial: 1000 },
      { day: 'Vie', online: 1700, presencial: 1300 },
      { day: 'Sáb', online: 2000, presencial: 1500 },
      { day: 'Dom', online: 800, presencial: 600 }
    ];
  }

  getSatisfaction() {
    return {
      lastMonth: 4.2,
      thisMonth: 4.7
    };
  }

  getTarget() {
    return {
      real: 12450,
      target: 15000
    };
  }

  getTopServices() {
    return [
      { name: 'Consulta General', percent: 45 },
      { name: 'Vacunación', percent: 30 },
      { name: 'Desparasitación', percent: 18 },
      { name: 'Cirugías', percent: 7 }
    ];
  }

}
