import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
})
export class Admin implements AfterViewInit, OnDestroy {
  private chart?: Chart;

  constructor(private readonly router: Router) {}

  ngAfterViewInit(): void {
    this.initializeChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private initializeChart(): void {
    const ctx = document.getElementById('healthChart') as HTMLCanvasElement | null;
    if (!ctx) {
      return;
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['September', 'November', 'December', 'January'],
        datasets: [
          {
            label: 'Health Score',
            data: [7, 5, 8, 9],
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            grid: {
              display: true,
              color: 'rgba(0,0,0,0.05)',
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }

  logout() {
    // Implementar lógica de logout
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
