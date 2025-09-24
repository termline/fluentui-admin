import React from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import useGlobalStore from '../store';
import { Dropdown, Option, Button } from '@fluentui/react-components';
import { roleCodes, roleLabel } from '../utils/roles';
import { setLocale, getLocale, t } from '../i18n';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    background: tokens.colorNeutralBackground1,
    minHeight: '56px'
  },
  title: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    flex: 1,
    color: tokens.colorNeutralForeground1
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS
  },
  dropdown: {
    minWidth: '120px'
  },
  localeDropdown: {
    minWidth: '110px'
  }
});

const Header = () => {
  const styles = useStyles();
  const { user, setUser } = useGlobalStore();
  const devSwitchEnabled = import.meta.env.VITE_DEV_ROLE_SWITCH !== 'false';

  const handleRoleChange = (_, data) => {
    if (!user) return;
    setUser({ ...user, role: data.optionValue });
  };

  const handleLogout = () => setUser(null);

  const [locale, setLocState] = React.useState(getLocale());
  React.useEffect(() => {
    const handler = (e) => setLocState(e.detail.locale);
    window.addEventListener('app-locale-changed', handler);
    return () => window.removeEventListener('app-locale-changed', handler);
  }, []);

  const changeLocale = (_, data) => {
    setLocale(data.optionValue);
  };

  return (
    <header className={styles.header}>
      <div className={styles.title}>{t('app.title','Admin Console')}</div>
      {user && devSwitchEnabled && (
        <div className={styles.controls}>
          <Dropdown 
            size="small" 
            selectedOptions={[user.role]} 
            onOptionSelect={handleRoleChange}
            className={styles.dropdown}
          >
            {roleCodes.map(r => <Option key={r} value={r}>{roleLabel(r)}</Option>)}
          </Dropdown>
          <Dropdown 
            size="small" 
            selectedOptions={[locale]} 
            onOptionSelect={changeLocale}
            className={styles.localeDropdown}
          >
            <Option value="zh-CN">中文</Option>
            <Option value="en-US">English</Option>
          </Dropdown>
          <Button size="small" onClick={handleLogout}>退出</Button>
        </div>
      )}
    </header>
  );
};

export default Header;
