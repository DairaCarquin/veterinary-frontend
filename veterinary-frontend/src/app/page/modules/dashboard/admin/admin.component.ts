import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../../service/dashboard.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis
} from 'ng-apexcharts';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {

  kpis: any;
  weeklyRevenue: any[] = [];
  satisfaction: any;
  target: any;
  topServices: any[] = [];

  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.kpis = this.dashboardService.getKpis();
    this.weeklyRevenue = this.dashboardService.getWeeklyRevenue();
    this.satisfaction = this.dashboardService.getSatisfaction();
    this.target = this.dashboardService.getTarget();
    this.topServices = this.dashboardService.getTopServices();
  }
  public revenueSeries: ApexAxisChartSeries = [
    {
      name: 'Ingresos',
      data: [1200, 1500, 900, 1400, 1700, 2000, 800]
    }
  ];

  public revenueChart: ApexChart = {
    type: 'bar',
    height: 300
  };

  public revenueXAxis: ApexXAxis = {
    categories: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  };

  public satisfactionSeries: ApexAxisChartSeries = [
    {
      name: 'Satisfacción',
      data: [4.1, 4.3, 4.5, 4.4, 4.6, 4.7]
    }
  ];

  public lineChart: ApexChart = {
    type: 'line',
    height: 300
  };

  public monthsXAxis: ApexXAxis = {
    categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
  };
}
