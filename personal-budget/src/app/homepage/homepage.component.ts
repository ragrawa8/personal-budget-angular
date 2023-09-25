import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import * as d3 from 'd3';
import { DataService } from '../data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

Chart.register(...registerables);

interface BudgetItem {
  title: string;
  budget: number;
}

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit, OnDestroy {
  public dataSource = {
    datasets: [{
      data: [] as number[],
      backgroundColor: ['#ffcd56', '#ff6384', '#36a2eb', '#fd6b19', '#283747', '#7D3C98', '#FA0404', '#2ECC71'],
    }],
    labels: [] as string[],
  };

  private myBudget: BudgetItem[] = [];
  private destroy$: Subject<void> = new Subject<void>();

  constructor(private http: HttpClient, private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.fetchData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          this.myBudget = (res as any).myBudget;
          for (let item of this.myBudget) {
            this.dataSource.datasets[0].data.push(item.budget);
            this.dataSource.labels.push(item.title);
          }
          console.log('Received data:', res);
          this.createChart();
          this.createBarChart();
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createChart() {
    const canvas = document.getElementById('myChart') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const myPieChart = new Chart(ctx, {
          type: 'pie',
          data: this.dataSource,
        });
      }
    }
  }

  createBarChart(): void {
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 500 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const color = d3
      .scaleOrdinal()
      .domain(this.myBudget.map((d) => d.title))
      .range(this.dataSource.datasets[0].backgroundColor);

    const x = d3.scaleBand().range([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);

    const svg = d3
      .select('#barChart')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    x.domain(this.myBudget.map((d) => d.title));
    y.domain([0, d3.max(this.myBudget, (d) => d.budget)!]);

    svg
      .selectAll('.bar')
      .data(this.myBudget)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.title)!)
      .attr('width', x.bandwidth())
      .attr('y', (d) => y(d.budget)!)
      .attr('height', (d) => height - y(d.budget)!)
      .attr('fill', (d) => color(d.title) as string);

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append('g').call(d3.axisLeft(y));
  }
}
