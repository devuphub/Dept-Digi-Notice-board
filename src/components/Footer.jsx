import React from 'react';
import { INSTITUTE_INFO } from '../config/institute';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-accent-line" />
      <div className="container footer-inner">
        <p className="footer-dev">
          <strong>Developed &amp; Maintained By:</strong>{' '}
          {INSTITUTE_INFO.teamMembers.join(', ')} ({INSTITUTE_INFO.branchSection})
        </p>
        <p className="footer-team">{INSTITUTE_INFO.teamLabel}</p>
        <p className="footer-copy">{INSTITUTE_INFO.copyright}</p>
      </div>
    </footer>
  );
}
