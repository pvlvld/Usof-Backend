import { InternalServerError } from "../../shared/consts/errors.js";

export class StatsService {
  private static instance: StatsService;
  private getChartUrl = {
    users: (dateRange: [Date, Date]) => {
      return `${this.getBaseGrafanaChartURL(dateRange)}&panelId=1`;
    },
    posts: (dateRange: [Date, Date]) => {
      return `${this.getBaseGrafanaChartURL(dateRange)}&panelId=2`;
    },
    reactions: (dateRange: [Date, Date]) => {
      return `${this.getBaseGrafanaChartURL(dateRange)}&panelId=3`;
    }
  };

  public static getInstance() {
    if (!this.instance) {
      this.instance = new StatsService();
    }
    return this.instance;
  }

  public async getStatsChart(type: "users" | "posts" | "reactions") {
    // return await this.fetchGrafanaPanel(
    //   this.getChartUrl[type](this.get30dRange())
    // );

    // I cudn't make grafana iframes work propperly, i gave up
    return this.getChartUrl[type](this.get30dRange());
  }

  private get30dRange() {
    const range = [new Date(), new Date()] as any;
    range[0].setDate(range[0].getDate() - 30);
    return range;
  }

  private getBaseGrafanaChartURL(dateRange: [Date, Date]) {
    return `${process.env.GRAFANA_DASHBOARD_URL}&from=${dateRange[0].getTime()}&to=${dateRange[1].getTime()}`;
  }

  private async fetchGrafanaPanel(url: string) {
    const fetchRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.GRAFANA_API_KEY}`
      }
    });

    const bodyText = await fetchRes.text();

    if (!fetchRes.ok) {
      console.error("Grafana fetch error:", fetchRes.status, bodyText);
      throw new InternalServerError("Grafana fetch error");
    }

    return bodyText;
  }
}
