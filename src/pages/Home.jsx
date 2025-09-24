import React from 'react';
import { makeStyles, tokens, Card } from '@fluentui/react-components';
import PageContainer from '../components/PageContainer';

const useStyles = makeStyles({
  welcomeCard: {
    padding: tokens.spacingHorizontalL
  },
  description: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
    lineHeight: tokens.lineHeightBase300,
    margin: 0
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: tokens.spacingHorizontalM
  },
  statCard: {
    padding: tokens.spacingHorizontalM,
    textAlign: 'center'
  },
  statValue: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorBrandForeground1
  },
  statLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    marginTop: tokens.spacingVerticalXS
  }
});

const Home = () => {
  const styles = useStyles();
  
  return (
    <PageContainer 
      title="仪表盘"
      subtitle="系统概览和关键指标"
    >
      <Card className={styles.welcomeCard}>
        <p className={styles.description}>
          欢迎来到管理后台！您可以通过左侧导航栏访问不同的功能模块，
          包括用户管理、主机管理、服务监控等。下方显示了系统的关键统计信息。
        </p>
      </Card>
      
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statValue}>156</div>
          <div className={styles.statLabel}>活跃用户</div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statValue}>42</div>
          <div className={styles.statLabel}>在线主机</div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statValue}>98.5%</div>
          <div className={styles.statLabel}>系统可用性</div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statValue}>24</div>
          <div className={styles.statLabel}>运行服务</div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Home;
