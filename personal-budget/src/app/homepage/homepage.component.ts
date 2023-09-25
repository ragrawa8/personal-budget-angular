import { Component, AfterViewInit } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Chart } from 'chart.js'; 

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements AfterViewInit{

  public dataSource:any = {
    datasets: [
      {
        data: [],
        backgroundColor: [
          "#FF5733",
          "#33FF57",
          "#5733FF",
          "#FF33A2",
          "#A233FF",
          "#33A2FF",
          "#FFFF00",
        ],
      },
    ],
    labels: [],
  };

  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    this.http.get('http://localhost:3000/budget')
    .subscribe((res:any) => {
      for (var i = 0; i < res.myBudget.length; i++) {
        this.dataSource.datasets[0].data[i] = res.myBudget[i].budget;
        this.dataSource.labels[i] = res.myBudget[i].title;
        this.createChart();
    }
    });
  }

  createChart() {
    var ctx = document.getElementById("myChart") as HTMLCanvasElement;
    var myPieChart = new Chart(ctx, {
      type: "pie",
      data: this.dataSource,
    });
  }

}
