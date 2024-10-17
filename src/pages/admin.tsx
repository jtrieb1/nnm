import React from 'react';
import BACKEND_URL from '../util/aws';
import Layout from '../components/layout/Layout';
import { Buffer } from 'buffer';
import { CognitoJwtVerifier } from "aws-jwt-verify";

const IssueUploadComponent: React.FC<{access_token: string}> = ({ access_token }) => {
    const [file, setFile] = React.useState<File | null>(null);
    const [issueNumber, setIssueNumber] = React.useState<string>("0");
    const [blurb, setBlurb] = React.useState<string>('');
    const [contributors, setContributors] = React.useState<Array<{name: string, handle: string}>>([]);
    const [loading, setLoading] = React.useState<boolean>(false);

    const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) {
            alert('No file selected');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('access_token', access_token);
        formData.append('issue_number', issueNumber || "0");
        formData.append('contributors', JSON.stringify(contributors));
        formData.append('blurb', blurb);

        setLoading(true);

        const response = await fetch(BACKEND_URL + "/upload", {
            method: 'POST',
            body: formData
        });

        setLoading(false);

        if (response.ok) {
            alert('Upload successful');
        } else {
            alert('Upload failed');
        }
    }

    return (
        <div className="issue-upload">
            <h1 className="issue-upload__title">Issue Upload</h1>
            <form className="issue-upload__form" onSubmit={onFormSubmit}>
                <label className="issue-upload__label">Issue Number</label>
                <input className="issue-upload__input" type='number' value={issueNumber} onChange={e => setIssueNumber(e.target.value)} />
                <label className="issue-upload__label">Blurb</label>
                <input className="issue-upload__input" type='text' value={blurb} onChange={e => setBlurb(e.target.value)} />
                <label className="issue-upload__label">Contributors</label>
                <div className="issue-upload__contributors">
                    {
                        contributors.map((contributor, index) => (
                            <div key={index} className="issue-upload__contributor">
                                <input className="issue-upload__input" type='text' placeholder='Name' value={contributor.name} onChange={e => {
                                    const newContributors = contributors.slice();
                                    newContributors[index].name = e.target.value;
                                    setContributors(newContributors);
                                }} />
                                <input className="issue-upload__input" type='text' placeholder='Handle' value={contributor.handle} onChange={e => {
                                    const newContributors = contributors.slice();
                                    newContributors[index].handle = e.target.value;
                                    setContributors(newContributors);
                                }} />
                                <button className="issue-upload__button" type='button' onClick={() => {
                                    const newContributors = contributors.slice();
                                    newContributors.splice(index, 1);
                                    setContributors(newContributors);
                                }}>Remove</button>
                            </div>
                        ))
                    }
                </div>
                <button className="issue-upload__button" type='button' onClick={() => setContributors([...contributors, {name: '', handle: ''}])}>Add Contributor</button>
                <label className="issue-upload__label">File</label>
                <input className="issue-upload__file-input" type='file' onChange={e => setFile(e.target.files?.item(0) || null)} />
                {
                    loading
                        ? <p className="issue-upload__loading">Uploading...</p>
                        : <button className="issue-upload__button" type='submit'>Upload</button>
                }
            </form>
        </div>
    );
}

const AdminPage = ({ location }: { location: any }) => {
    const [userToken, setUserToken] = React.useState<string | null>(null);
    const [userTokenValid, setUserTokenValid] = React.useState<boolean>(false);

    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    const verifier = CognitoJwtVerifier.create({
        userPoolId: process.env.GATSBY_PUBLIC_COGNITO_USER_POOL_ID || "",
        tokenUse: "access",
        region: process.env.GATSBY_PUBLIC_COGNITO_REGION || "",
        clientId: process.env.GATSBY_PUBLIC_COGNITO_CLIENT_ID || ""
    });

    const verifyToken = async (token: string) => {
        try {
            await verifier.verify(token);
            setUserTokenValid(true);
            return true;
        } catch (err) {
            console.error(err);
            setUserTokenValid(false);
            return false;
        }
    };

    // For testing, remove before pushing
    React.useEffect(() => {
        if (!code) {
            return;
        }
        const clientID = process.env.GATSBY_PUBLIC_COGNITO_CLIENT_ID || "";
        const clientSecret = process.env.GATSBY_PUBLIC_COGNITO_CLIENT_SECRET || "";
        const cognitoDomain = process.env.GATSBY_PUBLIC_COGNITO_DOMAIN || "";
        const credentials = `${clientID}:${clientSecret}`;
        const base64Credentials = Buffer.from(credentials).toString('base64');
        const basicAuthorization = `Basic ${base64Credentials}`;
        const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": basicAuthorization
        };
        const data = new URLSearchParams();
        let token = "";
        data.append("grant_type", "authorization_code");
        data.append("client_id", clientID);
        data.append("code", code || "");
        data.append("redirect_uri", "https://nonothing.online/admin");
        fetch(`https://${cognitoDomain}/oauth2/token`, {
            method: 'POST',
            headers: headers,
            body: data
        })
            .then(response => response.json())
            .then(data => {
                token = data.access_token;
                setUserToken(token);
                return verifyToken(token);
            })
            .catch(err => console.error(err));
    }, [code]);

    const forwardToLogin = () => {
        const clientID = process.env.GATSBY_PUBLIC_COGNITO_CLIENT_ID || "";
        const cognitoDomain = process.env.GATSBY_PUBLIC_COGNITO_DOMAIN || "";
        const redirectURI = "https://nonothing.online/admin";
        window.location.href = `https://${cognitoDomain}/login?response_type=code&client_id=${clientID}&redirect_uri=${redirectURI}`;
    }

    return (
        <Layout clipbg={false}>
            <br />
            {
                userTokenValid
                    ? <IssueUploadComponent access_token={userToken || ""}/>
                    : <button className="loginbutton" onClick={forwardToLogin}>Log In</button>
            }
        </Layout>
    );
}

export default AdminPage;