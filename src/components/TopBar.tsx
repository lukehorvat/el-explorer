import React from 'react';
import './TopBar.css';

export function TopBar(): React.JSX.Element {
  return (
    <div className="TopBar">
      <div className="Brand">Creatures of EL</div>
      <div className="Fork">
        <a href="https://github.com/lukehorvat/el-creatures">GitHub</a>
      </div>
    </div>
  );
}
