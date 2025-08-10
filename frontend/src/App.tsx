import React, { useState } from 'react';
import Map from './components/Map';
import SearchBar from './components/SearchBar';
import PoolForm from './components/PoolForm';
import AuthForm from './components/AuthForm';
import PoolList from './components/PoolList';

function App() {
  const [user, setUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [pools, setPools] = useState([]);
  const [searchLocation, setSearchLocation] = useState('');

  return (
    <div className="app">
      <header className="header">
        <h1>Pool Finder</h1>
        {user ? (
          <div className="user-controls">
            <span>Welcome, {user.name}</span>
            <button onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? 'Cancel' : 'Add Pool'}
            </button>
            <button onClick={() => setUser(null)}>Logout</button>
          </div>
        ) : (
          <AuthForm onAuth={setUser} />
        )}
      </header>
      
      <main className="main">
        <SearchBar onSearch={setSearchLocation} />
        
        {showAddForm && (
          <PoolForm onSubmit={(pool) => {
            setPools([...pools, pool]);
            setShowAddForm(false);
          }} />
        )}
        
        <div className="content">
          <Map pools={pools} searchLocation={searchLocation} />
          <PoolList pools={pools} />
        </div>
      </main>
    </div>
  );
}

export default App;
