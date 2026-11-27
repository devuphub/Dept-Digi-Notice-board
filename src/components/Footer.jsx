import React from 'react';
import { INSTITUTE_INFO } from '../config/institute';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-left">
          <p className="footer-dev">
            <strong>Developed &amp; Maintained By:</strong>{' '}
            {INSTITUTE_INFO.teamMembers.join(', ')} ({INSTITUTE_INFO.branchSection})
          </p>
          <p className="footer-team">
            {INSTITUTE_INFO.teamLabel} · Mentored by {INSTITUTE_INFO.mentor}
          </p>
        </div>
        <div className="footer-right">
          <p className="footer-copy">{INSTITUTE_INFO.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
