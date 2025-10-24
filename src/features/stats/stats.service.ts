import { InternalServerError } from "../../shared/consts/errors.js";

export class StatsService {
  private static instance: StatsService;
  private grafanaDashboardUrl =
    "https://soniashnyk.pp.ua/monitor/d-solo/bf21h176d22v4c/usof?orgId=1&timezone=browser";
  private getChartUrl = {
    users: (dateRange: [Date, Date]) => {
      return `${this.grafanaDashboardUrl}&from=${dateRange[0].getTime()}&to=${dateRange[1].getTime()}&panelId=1`;
    },
    posts: (dateRange: [Date, Date]) => {
      return `${this.grafanaDashboardUrl}&from=${dateRange[0].getTime()}&to=${dateRange[1].getTime()}&panelId=2`;
    },
    reactions: (dateRange: [Date, Date]) => {
      return `${this.grafanaDashboardUrl}&from=${dateRange[0].getTime()}&to=${dateRange[1].getTime()}&panelId=3`;
    }
  };

  public static getInstance() {
    if (!this.instance) {
      this.instance = new StatsService();
    }
    return this.instance;
  }

  public async getUserStats() {
    return await this.fetchGrafanaPanel(
      this.getChartUrl.users(this.get30dRange())
    );
  }

  public async getPostStats() {
    return await this.fetchGrafanaPanel(
      this.getChartUrl.posts(this.get30dRange())
    );
  }

  public async getReactionStats() {
    return await this.fetchGrafanaPanel(
      this.getChartUrl.reactions(this.get30dRange())
    );
  }

  private get30dRange() {
    const ranges = [new Date(), new Date()] as any;
    ranges[0].setDate(ranges[0].getDate() - 30);
    return ranges;
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
