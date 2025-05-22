import { finalize } from 'rxjs';
import { ChartUrlRequestModel } from '@shared/models/links/clickurl.model';
import { BaseComponent } from '@shared/components/base/base.component';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { htmlUrls } from '@shared/helper/app_routes';
import { JalaliPipe } from '@shared/pipes/jalali.pipe';
import { ChartConfiguration, ChartType } from 'chart.js';
import { Filter, Sort } from '@shared/models/search-filter-model';
import { LinkModel } from '@shared/models/links/link.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { LocalRepository } from '@shared/helper/local-repository';
import { FilterOptionsEnum } from '@shared/enums/filter-options-enum';
import { SearchFilterModel } from '@shared/models/search-filter-model';
import { LinkService } from '@shared/service/http_services/links/link.service';
import { GetClickChart } from '@shared/service/http_services/links/clickurl.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { SnackBarTypes } from '@shared/components/cutome-snack-bar/custome-snack-bar.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent extends BaseComponent implements OnInit {
  showchart: boolean = false;
  isMobile: boolean;
  loading: boolean = true;
  loadingChart: boolean = true;
  defaultStartDate: Date = new Date();
  defaultEndDate: Date = new Date();
  jalaliPipe: JalaliPipe = new JalaliPipe();
  // ? startDate
  startDate: any;
  // ? endDate
  endDate: any;
  // ? selected max date for calendar
  maxDate: Date;
  maxStartDate: Date;
  // ? set disabled property for end Date
  btnDisabled: boolean = true;
  // ? range between dates
  rangeDate: any;
  // ? selected filter
  routes = htmlUrls;
// ? selected min date for calendar
  minDate: any;

  // ? chart configuration
  lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'کل کلیک',

        backgroundColor: 'rgba(228, 197, 157,0.1)',
        borderColor: 'rgba(228, 197, 157,0.5)',
        pointBackgroundColor: 'rgba(228, 197, 157,0.5',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 5,
        pointHoverBorderWidth: 15,
        pointHoverBorderColor: 'rgba(148,159,177,0.8)',
        pointHitRadius: 20,
        fill: 'origin',

      },
      {
        data: [],
        label: 'تعداد کلیک های منحصر به فرد ',
        backgroundColor: 'rgb(228, 228, 228,0.3)',
        borderColor: '#2bae66',
        pointBackgroundColor: '#2bae66',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 5,
        pointHoverBorderWidth: 15,
        pointHoverBorderColor: 'rgba(148,159,177,0.8)',
        pointHitRadius: 20,
        fill: 'origin',
      },
    ],
    labels: [],
  };

  lineChartOptions: ChartConfiguration['options'] = {
    scales: {
      xAxis: {
        ticks: {
          font: {
            family: 'ESTEDAD_MEDIUM',
            size: 9,
          },
        },
      },
    },
    elements: {
      line: {
        tension: 0.5,
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          font: {
            family: 'ESTEDAD_MEDIUM',
            size: 8,
            
          },
        },
      },
    },
    responsive: true,
  };

  lineChartType: ChartType = 'line';

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  // ? book list
  books: LinkModel[] = [];
  searchFilter: SearchFilterModel = new SearchFilterModel();
  constructor(
    private localRepository: LocalRepository,
    private linkService: LinkService,
    private getclickchart: GetClickChart,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private _snackBar: MatSnackBar
  ) {
    super();
    this.maxDate = new Date();
    this.maxStartDate = new Date();
  }

  ngOnInit(): void {
    this.isMobile = this.localRepository.IsInMobile;

    this.defaultStartDate.setDate(this.defaultStartDate.getDate() - 30);

    // ? Get Data Chart
    this.getChartDate(this.defaultStartDate, this.defaultEndDate);

    this.searchFilter.pgNumber = 0;
    this.searchFilter.pgSize = 8;
    this.searchFilter.filter = new Filter(
      'isDeleted',
      FilterOptionsEnum.Equals,
      false
    );
    
    this.searchFilter.sort = new Sort('viewCount', 1);
    this.searchFilter.orderFilters!.push(this.searchFilter.sort);
    this.linkService.getAllLinks(this.searchFilter).pipe(
      finalize(() => {
        this.loading = false; 
      })
    ).subscribe((res) => {
      if (!res.hasError) {
        this.books = res.result.items.sort((a, b) => {
          if (a.viewCount > b.viewCount) return -1;
          if (a.viewCount == b.viewCount) return 0;
          if (a.viewCount < b.viewCount) return 1;

          return 0;
        });
      }
    });
  }

  getChartDate(startDate: any, endDate: any) {
    this.lineChartData.datasets[0].data = [];
    this.lineChartData.datasets[1].data = [];
    this.lineChartData.labels = [];
    const urlRequestModel = new ChartUrlRequestModel();
    urlRequestModel.startDate = startDate;
    urlRequestModel.endDate = endDate;
    this.getclickchart.getClickChart(urlRequestModel).subscribe((res) => {
      if (!res.hasError) {
        this.loadingChart = false;
        this.showchart = true;
        res.result.items.forEach((x) => {
          this.lineChartData.datasets[0].data.push(x.totalClicks!);
          this.lineChartData.datasets[1].data.push(x.uniqClicks!);
          this.lineChartData?.labels?.push(this.jalaliPipe.transform(x.date));
        });
      } else {
        this.showchart = true;
        this.openSnackbar(
          SnackBarTypes.error,
          'بازه زمانی باید بین 3 ماه باشد',
          this._snackBar,
          4
        );
      }
    });
  }

  // ? function filter start date
  onFilterStartDate(event: MatDatepickerInputEvent<Date>) {
    this.btnDisabled = false;
    this.showchart = false;
    this.minDate = new Date(`${event.value}`);
    this.startDate = this.setDate(this.setTime(new Date(`${event.value}`), '00:00:00'));
    this.endDate =  this.endDate !== undefined ? this.endDate :  this.setTime(new Date(), '23:59:59');
    this.getChartDate(this.startDate, this.endDate);
  }

  // ? function filter end date
  onFilterEndDate(event: MatDatepickerInputEvent<Date>) {
    this.showchart = false;
    this.maxStartDate = new Date(`${event.value}`);
    this.endDate = this.setDate(this.setTime(new Date(`${event.value}`), '23:59:59'));

    this.getChartDate(this.startDate, this.endDate);
  }

  // ? function set time for filter date
  setTime(date: Date, hour: string) {
    let dateTime = date.toISOString();
    let newDateTime = dateTime.replace(dateTime.split('T')[1].slice(0,8), hour);
    return newDateTime;
  }

  // ? function set date
  setDate(date: string) {
    let newDate = new Date(new Date(date).setDate(new Date(date).getDate() + 1)).toISOString();
    return newDate;
  }

}
