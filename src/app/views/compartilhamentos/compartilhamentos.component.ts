import { map } from 'rxjs/operators';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';
import { IUsers } from 'src/app/interfaces/users';
import { FilessService } from 'src/app/services/files/files.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-compartilhamentos',
  templateUrl: './compartilhamentos.component.html',
  styleUrls: ['./compartilhamentos.component.scss']
})

export class CompartilhamentosComponent implements OnInit, AfterViewInit {

  constructor(
    private filesService: FilessService,
    private datePipe: DatePipe) { }

  private dataDoug: DoughnutData[] = [];
  private dataLine: LineData[] = [];

  private verticalBarData =
    {
      menos18: 0,
      de18a23: 0,
      de24a34: 0,
      de35a50: 0,
      mais50: 0,
    };

  private quantidadeDiasRecentes = 7;

  private get dataDownloadMaxima(): Date {
    const today = new Date();
    const dataAntiga = new Date(today.setDate(today.getDate() - this.quantidadeDiasRecentes));
    return new Date(dataAntiga.setHours(0, 0, 0));
  }

  private get diaMesLineChart(): diaMes[] {
    let dias = [] as diaMes[];

    const today = new Date();
    for (let index = 0; index < this.quantidadeDiasRecentes; index++) {
      const dia = new Date(today.setDate(today.getDate() - index)).getDate();
      const mes = new Date(today.setDate(today.getDate() - index)).getMonth();
      dias.push({ dia: dia, mes: mes } as diaMes);
    };

    return dias;
  }

  ngOnInit(): void {

    // Chama no Firebase as informações do FIles do Usuário logado 
    this.filesService.collection$((ref) => ref.where("ownerId", "==", "bDG3Lp6j7GfRBSI0WwvV")).subscribe((files) => {
      let listBirthdays = [] as Date[];
      let listDownloadsDates = [] as Date[];
      console.log(files);
      files.forEach(f => {
        // Para cada File, agrupa por Estado
        const downloadGroupByCustomers = groupBy(f.customers, c => c.state);
        listBirthdays = listBirthdays.concat(f.customers.map(c => new Date(parseInt(c.birthday.toString(), 10))));

        listDownloadsDates = listDownloadsDates.concat(f.customers.filter(c =>
          new Date(parseInt(c.downloadDate.toString(), 10)) >= this.dataDownloadMaxima)
          .map(c =>
            new Date(parseInt(c.downloadDate.toString(), 10))
          ));

        // Pega todos os Estados encontrados
        const key = (Object.keys(downloadGroupByCustomers) as Array<string>);

        // Para cada Estado, verifica a quantidade de pessoas que baixou o arquivo
        key.forEach(key => {
          // Índice para verificar se já existe esse item na lista
          const indexOfExistingItem = this.dataDoug.findIndex(dd => dd.state === key);

          // Se não houver, adiciona. Caso contrário, soma com o item que já existe
          if (indexOfExistingItem === -1) {
            this.dataDoug.push({ state: key as string, quantidade: downloadGroupByCustomers[key].length as number } as DoughnutData);
          } else {
            this.dataDoug[indexOfExistingItem].quantidade += downloadGroupByCustomers[key].length;
          }
        });
      });

      // TODO: Visão em Tabela
      if (this.dataDoug.length > 3) {
        // Ordena por quantidade de Downloads
        this.dataDoug = this.dataDoug.sort((estadoA, estadoB) => estadoB.quantidade - estadoA.quantidade);

        // Pega a partir do Quarto Estado
        let estadosMinoritarios = this.dataDoug.splice(3);

        this.dataDoug
          .push(
            {
              state: 'Outros' as string,
              quantidade: estadosMinoritarios
                .map(em => em.quantidade)
                .reduce((estadoA, estadoB) => estadoA + estadoB)
            } as DoughnutData);
      }

      this.verticalBarCreateData(listBirthdays);
      this.lineCreateData(listDownloadsDates);
      // Constrói os Charts
      this.doughnutChartMethod();
      this.verticalBarChartMethod();
      this.lineChartMethod();
    });
  }
  ngAfterViewInit(): void {

  }

  @ViewChild('verticalBarCanvas') private verticalBarCanvas: ElementRef;

  @ViewChild('doughnutCanvas') private doughnutCanvas: ElementRef;

  @ViewChild('lineCanvas') private lineCanvas: ElementRef;

  doughnutChartMethod() {
    this.doughnutCanvas = new Chart(this.doughnutCanvas.nativeElement,
      {
        type: 'doughnut',
        options: {
          maintainAspectRatio: false,
        },
        data: {
          labels: this.dataDoug.map(dd => dd.state),
          datasets: [{
            data: this.dataDoug.map(dd => dd.quantidade),
            fill: false,
            tension: 0.1,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 205, 86, 0.2)',
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(255, 159, 64)',
              'rgb(255, 205, 86)',
            ],
          }]
        }
      }
    )
  }

  verticalBarChartMethod() {
    const labels = [
      'Menos de 18',
      'De 18 a 23',
      'De 24 a 34',
      'De 35 a 50',
      'Mais de 50',
    ];

    const birthdayData = [
      this.verticalBarData.menos18,
      this.verticalBarData.de18a23,
      this.verticalBarData.de24a34,
      this.verticalBarData.de35a50,
      this.verticalBarData.mais50
    ]

    const data = {
      labels: labels,
      datasets: [{
        data: birthdayData,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(201, 203, 207, 0.2)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
          'rgb(201, 203, 207)'
        ],
        borderWidth: 1
      }]
    }

    this.verticalBarCanvas = new Chart(this.verticalBarCanvas.nativeElement,
      {
        type: 'bar',
        data: data,
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        },
      }
    )
  }

  lineChartMethod() {
    const labels = this.dataLine.map(dl => dl.dataDownload);
    const data = {
      labels: labels,
      datasets: [{
        label: 'My First Dataset',
        data: this.dataLine.map(dl => dl.quantidade),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(201, 203, 207, 0.2)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
          'rgb(201, 203, 207)'
        ],
        borderWidth: 1
      }]
    }

    this.lineCanvas = new Chart(this.lineCanvas.nativeElement,
      {
        type: 'line',
        data: data,
        options: {
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        },
      }
    )
  }

  private verticalBarCreateData(birthDays: Date[]) {
    birthDays.forEach(bd => {
      let timeDiff = Math.abs(Date.now() - bd.getTime());
      let age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365.25);
      if (age < 18) {
        this.verticalBarData.menos18++;
      } else if (age >= 18 && age <= 23) {
        this.verticalBarData.de18a23++;
      } else if (age >= 24 && age <= 34) {
        this.verticalBarData.de24a34++;
      } else if (age >= 35 && age <= 50) {
        this.verticalBarData.de35a50++;
      } else {
        this.verticalBarData.mais50++;
      }
    });
  }

  private lineCreateData(downloadDates: Date[]) {
    console.log(downloadDates)
    this.diaMesLineChart.forEach(data => {
      this.dataLine.push(
        {
          dataDownload: data.dia + '/' + data.mes,
          quantidade: downloadDates.filter(download => download.getDate() == data.dia).length
        } as LineData)
    });
  }
}

const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
  list.reduce((previous, currentItem) => {
    const group = getKey(currentItem);
    if (!previous[group]) previous[group] = [];
    previous[group].push(currentItem);
    return previous;
  }, {} as Record<K, T[]>);

class DoughnutData {
  state: string;
  quantidade: number;
}

class LineData {
  dataDownload: string;
  quantidade: number;
}

type diaMes = {
  dia: number;
  mes: number;
};