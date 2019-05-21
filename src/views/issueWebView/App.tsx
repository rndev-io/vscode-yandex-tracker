import { h, Component } from 'preact';

import { RawIssue, RawComment } from '../../api';

export interface State {
    issue: RawIssue | null;
    front: string;
    comments: RawComment[];
}

interface Message {
    command: string;
    args: any;
}

class App extends Component<any, State> {
    constructor() {
        super();
        this.reciveExtensionMessage = this.reciveExtensionMessage.bind(this);
        this.state = {
            issue: null,
            front: '',
            comments: []
        };
    }

    componentDidMount() {
        window.addEventListener('message', this.reciveExtensionMessage);
    }

    reciveExtensionMessage(event: any) {
        const message: Message = event.data;

        switch (message.command) {
            case 'issue': {
                this.setState({
                    issue: message.args.issue,
                    front: message.args.front,
                    comments: message.args.comments
                });
                break;
            }
            default:
                break;
        }

    }

    public render(props: any, state: State) {
        if(!state.issue) {
            return null;
        }
        const issue = state.issue;
        const created = new Date(issue.createdAt);
        const updated = new Date(issue.updatedAt);

        return (
            <div className='Issue'>
                <div class='Main'>
                    <h1 class='Summary'>{issue.summary}</h1>
                    <div className='Meta'>
                        <div className='Item'><a href={`${state.front}/${issue.key}`}>{issue.key}</a></div>
                        <div className='Item'>{issue.status.display}</div>
                        <div className='Item'>Created: {created.toDateString()}</div>
                        <div className='Item'>Updated: {updated.toDateString()}</div>
                    </div>
                    <div className='Description' dangerouslySetInnerHTML={{__html: issue.description}}/>
                    <div className='Comments'>
                        {state.comments.map((cmt) => {
                            return (
                                <div className='Comment'>
                                    <div class='Author'>{issue.createdBy ? issue.createdBy.display : ''}</div>
                                    <div dangerouslySetInnerHTML={{__html: cmt.text}}/>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div class='Sidebar'>
                    <table>
                        <tr>
                            <td>Type</td>
                            <td>{issue.type.display}</td>
                        </tr>
                        <tr>
                            <td>Priority</td>
                            <td>{issue.priority.display}</td>
                        </tr>
                        <tr>
                            <td>Status</td>
                            <td>{issue.status.display}</td>
                        </tr>
                        <tr>
                            <td>Assignee</td>
                            <td className='Author'>{issue.assignee ? issue.assignee.display : ''}</td>
                        </tr>
                        <tr>
                            <td>Author</td>
                            <td className='Author'>{issue.createdBy ? issue.createdBy.display : ''}</td>
                        </tr>
                        <tr>
                            <td>Followers</td>
                            <td>
                                {(issue.followers ? issue.followers : []).map((flr) => {
                                    return <div className='Author'>{flr.display}</div>;
                                })}
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        );
    }
}

export default App;