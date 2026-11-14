import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import './App.css';

function App() {
  const [active, setActive] = useState<number | 'all'>('all');
  const [openId, setOpenId] = useState<number | null>(null);

  const collections = useLiveQuery(() => db.collections.toArray(), []);
  const items = useLiveQuery(async () => {
    const all = await db.items.orderBy('createdAt').reverse().toArray();
    return active === 'all' ? all : all.filter((i) => i.collectionId === active);
  }, [active]);

  const nameOf = (id: number) =>
    collections?.find((c) => c.id === id)?.name ?? 'Unknown';

  return (
    <div className="shelf">
      <h1>Snippet Shelf</h1>

      <div className="tabs">
        <button
          className={active === 'all' ? 'tab active' : 'tab'}
          onClick={() => setActive('all')}
        >
          All
        </button>
        {collections?.map((c) => (
          <button
            key={c.id}
            className={active === c.id ? 'tab active' : 'tab'}
            onClick={() => setActive(c.id!)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {items?.length === 0 && (
        <p className="empty">
          Nothing saved yet. Select text on a page, right-click, and choose
          Save to Shelf.
        </p>
      )}

      <ul className="list">
        {items?.map((item) => {
          const open = openId === item.id;
          return (
            <li key={item.id} className="card">
              <div
                className="card-head"
                onClick={() => setOpenId(open ? null : item.id!)}
              >
                <span className="badge">{nameOf(item.collectionId)}</span>
                <span className="title">{item.title}</span>
              </div>

              {open && <pre className="content">{item.content}</pre>}

              <div className="meta">
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                <div className="actions">
                  <button onClick={() => navigator.clipboard.writeText(item.content)}>
                    Copy
                  </button>
                  {item.sourceUrl && (
                    <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                      Source
                    </a>
                  )}
                  <button className="danger" onClick={() => db.items.delete(item.id!)}>
                    Delete
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default App;