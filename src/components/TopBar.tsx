import React from 'react';
import './TopBar.css';

export function TopBar(): React.JSX.Element {
  return (
    <div className="TopBar">
      <div className="Brand">Creatures of Eternal Lands</div>
      <a
        className="Fork"
        href="https://github.com/lukehorvat/el-creatures"
        target="_blank"
      >
        GitHub
      </a>
    </div>
  );
}
