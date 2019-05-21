import { AxiosInstance } from 'axios';

export class Tracker {
    private _client: AxiosInstance;

    private host: string;

    private token: string;

    private orgId: string;

    private frontByHost: Map<string, string>;

    constructor(client: AxiosInstance, host: string, token: string, orgId: string = '') {
        this._client = client;
        this.host = host;
        this.token = token;
        this.orgId = orgId;
        this.frontByHost = new Map<string, string>([
            ['https://api.tracker.yandex.net/', 'https://tracker.yandex.ru'],
            ['https://st-api.test.yandex-team.ru/', 'https://st.test.yandex-team.ru'],
            ['https://st-api.yandex-team.ru/', 'https://st.yandex-team.ru'],
        ]);
    }

    private client(): AxiosInstance {
        this._client.defaults.baseURL = `${this.host}v2`;
        this._client.defaults.headers.common['Authorization'] = `OAuth ${this.token}`;
        this._client.defaults.headers.common['X-Org-Id'] = this.orgId;
        return this._client;
    }

    issues(): Issues {
        return new Issues(this.client());
    }

    front(): string {
        if (!this.frontByHost.has(this.host)) {
            throw Error(`Front for host ${this.host} not found`);
        }
        return this.frontByHost.get(this.host) || '';
    }

    async me(): Promise<User> {
        const response= await this.client().get('/myself');
        let data: RawUser = response.data;
        return new User(this.client(), data.uid);
    }
}

export class User {
    private client: AxiosInstance;

    private uid: Number;

    constructor(client: AxiosInstance, uid: Number){
        this.client = client;
        this.uid = uid;
    }

    async raw(): Promise<RawUser> {
        const response = await this.client.get(`/users/${this.uid}`);
        return response.data;
    }
}

interface RawUser {
    display: string;
    email: string;
    firstName: string;
    lastName: string;
    login: string;
    uid: Number;
}

export interface RawIssue {
    approvmentStatus: string;
    commentWithExternalMessageCount: Number;
    commentWithoutExternalMessageCount: Number;
    createdAt: string;
    createdBy?: {
        display: string;
        id: string;
        self: string;
    };
    assignee?: {
        display: string;
        id: string;
        self: string;
    };
    followers?: Array<{
        display: string;
        id: string;
        self: string;
    }>;
    favorite: boolean;
    id: string;
    key: string;
    lastCommentUpdatedAt: string;
    priority: {
        display: string;
        id: string;
        key: string;
        self: string;
    };
    queue: {
        display: string;
        id: string;
        key: string;
        self: string;
    };
    self: string;
    status: {
        display: string;
        id: string;
        key: string;
        self: string;
    };
    statusStartTime: string;
    summary: string;
    description: string;
    type: {
        display: string;
        id: string;
        key: string;
        self: string;
    };
    updatedAt: string;
    updatedBy: {
        display: string;
        id: string;
        key: string;
    };
    version: Number;
    votes: Number;
}

export interface RawComment {
    self: string;
    id: string;
    text: string;
    createdBy: {
        display: string;
        id: string;
        self: string;
    };
    updatedBy: {
        display: string;
        id: string;
        key: string;
    };
    createdAt: string;
    updatedAt: string;
}

export class Issues {
    private client: AxiosInstance;

    constructor(client: AxiosInstance){
        this.client = client;
    }

    async * search(query: string): AsyncIterator<Issue> {
        let page = 1;
        const perPage = 50;
        while(true) {
            const response = await this.client.post(
                '/issues/_search',
                { query: query },
                {params: {page: page, perPage: perPage}}
            );
            yield * response.data.map((item: RawIssue) => {
                return new Issue(this.client, item.key, item.summary);
            });
            if (!response.headers.link.includes('rel="next"')){
                break;
            }
            page++;
        }
    }

    get(number: string): Issue {
        return new Issue(this.client, number);
    }
}

export class Issue {
    // @ts-ignore
    private client: AxiosInstance;
    private num: string;
    private dsc:string;

    constructor(client: AxiosInstance, number: string, title: string = '') {
        this.client = client;
        this.num = number;
        this.dsc = title;
    }

    number(): string {
        return this.num;
    }

    async description(): Promise<string> {
        return this.dsc === '' ? (await this.raw()).summary : this.dsc;
    }

    async raw(): Promise<RawIssue> {
        const response = await this.client.get(`/issues/${this.num}`);
        return response.data;
    }

    comments(): Comments {
        return new Comments(this.client, this.num);
    }
}

export class Comments {
    private client: AxiosInstance;
    private issueNumber: string;

    constructor(client: AxiosInstance, issueNumber: string) {
        this.client = client;
        this.issueNumber = issueNumber;
    }

    async all(): Promise<Comment[]> {
        const response = await this.client.get(`/issues/${this.issueNumber}/comments`);
        return response.data.map((item: RawComment) => {
            return new Comment(this.client, this.issueNumber, item.id, item);
        });
    }
}

export class Comment {
    private client: AxiosInstance;

    private issueNumber: string;

    private commentId: string;

    private rawComment: RawComment | undefined;

    constructor(client: AxiosInstance, issueNumber: string, commentId: string, raw?: RawComment) {
        this.client = client;
        this.issueNumber = issueNumber;
        this.commentId = commentId;
        this.rawComment = raw;
    }

    async raw(): Promise<RawComment> {
        if(this.rawComment !== undefined) {
            return Promise.resolve(this.rawComment);
        }
        const response = await this.client.get(`/issues/${this.issueNumber}/comments/${this.commentId}`);
        return response.data;
    }
}