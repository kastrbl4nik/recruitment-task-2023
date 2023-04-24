import React from 'react';
import { useEffect, useState } from 'react';
import { Layout as ILayout} from '../model';
import { Layout, Tile } from './Tiles';
import '../style.css';

export default function App() {
  const [layout, setLayout] = useState<ILayout>();

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('http://localhost:8080/definition');
      const data = await response.json();
      setLayout(data);
    }
    
    fetchData();
  }, []); // receives the definition from the server

  return (
    <div className="main">
      <h1>{layout?.title}</h1>
      <div className="content">
        <Layout rootElement={layout?.rootElement}/>
      </div>
    </div>
  );
}
