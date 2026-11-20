import React from 'react';
import { TrendingUp, Lightbulb } from 'lucide-react';
import { mockMarketSkills } from '../mockData/careerData';
import { Layout, Page } from '../components/Layout';

const trendingRoles = ['Data Analyst', 'Business Analyst', 'Data Scientist', 'BI Analyst', 'ML Engineer'];

export default function MarketIntelligence() {
  return (
    <Layout>
      <Page title="Job Market Intelligence" subtitle="Explore in-demand skills and industry trends">
        <div className="ui-grid cols-2">
          <div className="card card-pad">
            <div className="card-head">
              <h3 className="card-title">Most In-Demand Skills</h3>
            </div>
            {mockMarketSkills.map((s, i) => (
              <div className="bar-row" key={s.name}>
                <span className="bar-label">{s.name}</span>
                <div className="bar-bg">
                  <div className={'bar ' + (i < 2 ? 'green' : i < 4 ? '' : 'purple')} style={{ width: s.demand + '%' }} />
                </div>
                <b className="bar-num">{s.demand}%</b>
              </div>
            ))}
          </div>

          <div className="card card-pad">
            <div className="card-head">
              <h3 className="card-title">Trending Job Roles</h3>
            </div>
            {trendingRoles.map((x, i) => (
              <div className="list-row" key={x}>
                <span className="list-icon"><TrendingUp size={16} /></span>
                <div className="list-main">
                  <strong>{x}</strong>
                  <span>Growing demand across data teams</span>
                </div>
                <span className="pill good">+{18 - i * 2}%</span>
              </div>
            ))}
            <div className="notice info" style={{ marginTop: 14 }}>
              <Lightbulb size={18} />
              <div className="notice-main">
                <span className="muted text-xs" style={{ display: 'block' }}>Market Insight</span>
                <strong>Python, SQL and Power BI are common baseline skills.</strong>
              </div>
            </div>
          </div>
        </div>
      </Page>
    </Layout>
  );
}
