import React from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  footer: {
    textAlign: 'center',
    padding: `${tokens.spacingVerticalM} 0`,
    background: tokens.colorNeutralBackground1,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const Footer = () => {
  const styles = useStyles();
  return (
    <footer className={styles.footer}>
      © 2025 Admin Console. All rights reserved.
    </footer>
  );
};

export default Footer;
