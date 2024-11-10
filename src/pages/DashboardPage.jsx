import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import ReactHlsPlayer from "react-hls-player"; // Import ReactHlsPlayer

function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [title, setTitle] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [errors, setErrors] = useState({ title: '', streamUrl: '' });

  useEffect(() => {
    const fetchCameras = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:5000/api/cameras/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const cameraData = await response.json();
          setCameras(cameraData);
        } else {
          console.error('Failed to fetch cameras.');
        }
      } catch (error) {
        console.error('Error fetching cameras:', error);
      }
    };

    fetchCameras();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setTitle('');
    setStreamUrl('');
    setErrors({ title: '', streamUrl: '' });
  };

  const addCamera = async () => {
    let isValid = true;
    let newErrors = { title: '', streamUrl: '' };

    if (!title) {
      newErrors.title = 'Title is required.';
      isValid = false;
    }

    if (!streamUrl) {
      newErrors.streamUrl = 'Stream URL is required.';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No access token found');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/cameras/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: title, stream_url: streamUrl }),
        });

        if (response.ok) {
          const newCamera = await response.json();
          setCameras([...cameras, newCamera]);
          closeModal();
        } else {
          console.error('Failed to add camera.');
        }
      } catch (error) {
        console.error('Error adding camera:', error);
      }
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <nav className="nav">
          <ul>
            <li className="nav-item active"><span>Cameras</span></li>
            <li className="nav-item"><span>Trackers</span></li>
          </ul>
        </nav>
        <div className="profile-section">
          <img src="path/to/profile-pic.jpg" alt="Profile" className="profile-pic" />
          <span className="profile-name">Arkraj Kundu</span>
          <button className="logout-btn">Log out</button>
        </div>
      </div>

      <main className="main-content">
        <header className="header">
          <h1>My Cameras</h1>
          <button className="add-camera-btn" onClick={openModal}>Add new camera +</button>
        </header>

        <div className="content">
          {cameras.length === 0 ? (
            <div className="no-cameras">
              <p className="no-cameras-message">You do not have any cameras added. Add now.</p>
              <button className="add-btn" onClick={openModal}>Add</button>
            </div>
          ) : (
            <ul className="camera-list">
              {cameras.map((camera) => (
                <li key={camera._id} className="camera-item">
                  <h3>{camera.name}</h3>
                  <div className="video-container">
                    {/* Use ReactHlsPlayer to render the video */}
                    <ReactHlsPlayer
                      src={camera.stream_url}
                      autoPlay={true}
                      controls={false}
                      width="100%"
                      height="auto"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Add a new camera</h2>
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              {errors.title && <p className="error-message">{errors.title}</p>}

              <label>Stream URL</label>
              <input
                type="text"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                required
              />
              {errors.streamUrl && <p className="error-message">{errors.streamUrl}</p>}

              <div className="modal-actions">
                <button className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button className="add-btn" onClick={addCamera}>Add</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;
