import React from 'react';
import useGlobalStore from '../store';
import { Dropdown, Option, Button } from '@fluentui/react-components';
import { roleCodes, roleLabel } from '../utils/roles';
import { setLocale, getLocale, t } from '../i18n';

const barStyle = { display:'flex', alignItems:'center', gap:16, padding:'8px 16px', borderBottom:'1px solid #eee', background:'#fff' };
const titleStyle = { fontSize:18, fontWeight:600, flex:1 };

const Header = () => {
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
    <header style={barStyle}>
      <div style={titleStyle}>{t('app.title','Admin Console')}</div>
      {user && devSwitchEnabled && (
        <>
          <Dropdown size="small" selectedOptions={[user.role]} onOptionSelect={handleRoleChange} style={{ minWidth:120 }}>
            {roleCodes.map(r => <Option key={r} value={r}>{roleLabel(r)}</Option>)}
          </Dropdown>
          <Dropdown size="small" selectedOptions={[locale]} onOptionSelect={changeLocale} style={{ minWidth:110 }}>
            <Option value="zh-CN">中文</Option>
            <Option value="en-US">English</Option>
          </Dropdown>
          <Button size="small" onClick={handleLogout}>退出</Button>
        </>
      )}
    </header>
  );
};

export default Header;
