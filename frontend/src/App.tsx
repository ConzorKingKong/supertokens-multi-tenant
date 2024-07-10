import "./App.css";
import SuperTokens, { SuperTokensWrapper } from "supertokens-auth-react";
import { Routes, BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./Home";
import { SuperTokensConfig, ComponentWrapper } from "./config";
import Auth from "./Auth";
import Tenants from "./Tenants";
import TenantId from "./TenantId";

SuperTokens.init(SuperTokensConfig);

function App() {
    return (
        <SuperTokensWrapper>
            <ComponentWrapper>
                <div className="App app-container">
                    <Router>
                        <div className="fill">
                            <Routes>
                                <Route path="/" element={<Home />}/>
                                {/* This shows the login UI on "/auth" route */}
                                <Route path="/auth/*" element={<Auth />} />
                                <Route path="/tenants" element={<Tenants />} />
                                <Route path="/tenants/:id" element={<TenantId />} />
                            </Routes>
                        </div>
                    </Router>
                </div>
            </ComponentWrapper>
        </SuperTokensWrapper>
    );
}

export default App;
