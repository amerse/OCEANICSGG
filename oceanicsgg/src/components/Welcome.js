import React from "react";
import './myStyles.css';

const heading = {
    color: 'cadetblue',
    fontSize: '72px'
}

function Welcome() {
    return (
        <div className="welcome-container">
        <h1 style = {{ fontSize: "68px", color: "cadetblue" }}>
            Welcome to OceanicsGG!
        </h1>
        <p style = {{ fontSize: "20px" }}>
            OceanicsGG is a website that simplifies group travel expenses by automating expense logging.
            Whether you're planning a trip with friends, family, or colleagues, our platform helps you keep track of who owes what, making it easy to settle up at the end of your journey.
        </p>
        <p style = {{ fontSize: "20px" }}>
            To get started, please log in or sign up to access all features of the
            platform.
        </p>
        </div>
    );
    }

export default Welcome;