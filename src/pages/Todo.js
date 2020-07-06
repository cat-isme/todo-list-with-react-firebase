import React, { Component } from "react";
import Header from "../components/Header";
import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import "./Todo.css";
import check from "./asset/checkk.png";

export default class Todolist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: auth().currentUser,
      todo: [],
      currentItem: {
        content: "",
        placeId: "",
        complete: false,
      },
      readError: null,
      writeError: null,
      loading: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.delItem = this.delItem.bind(this);
    this.completeItem = this.completeItem.bind(this);
    this.userVerification = this.userVerification.bind(this);
  }

  async componentDidMount() {
    var uid = this.state.user.uid;
    this.setState({ readError: null, loading: true });
    /*update the database on every change of child of uid*/
    try {
      db.ref("todo")
        .child(uid)
        .on("value", (snapshot) => {
          let todo = [];
          snapshot.forEach((snap) => {
            todo.push(snap.val());
          });
          this.setState({ todo });
          this.setState({ loading: false });
        });
    } catch (error) {
      this.setState({ readError: error.message, loading: false });
    }
  }

  userVerification(event) {
    var actionCodeSettings = {
      url: "https://to-do-list-with-react.web.app/todo",
      handleCodeInApp: false,
    };
    event.preventDefault();
    this.state.user
      .sendEmailVerification(actionCodeSettings)
      .then(function () {
        alert("Please check your mailbox for account confirmation link");
      })
      .catch(function (error) {
        this.setState({ readError: error.message });
      });
  }

  handleChange(event) {
    this.setState({
      currentItem: { content: event.target.value },
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    var uid = this.state.user.uid;
    var ref2 = db.ref("todo");
    this.setState({ writeError: null });
    this.setState({ currentItem: { complete: false } });
    /*push the content and update key to the database of the specific user*/
    ref2
      .child(uid)
      .push({
        content: this.state.currentItem.content,
      })
      .then((snapshot) => {
        ref2
          .child(uid)
          .child(snapshot.key)
          .update({
            key: snapshot.key,
            complete: this.state.currentItem.complete,
          })
          .then(this.setState({ currentItem: { placeId: snapshot.key } }))
          // .then(this.setState({ currentItem: { complete: false } }))
          .then(this.setState({ currentItem: { content: "" } }));
      });
  }

  async completeItem(key) {
    var uid = this.state.user.uid;
    await this.setState((preState) => ({
      currentItem: { complete: !preState.currentItem.complete },
    }));

    db.ref(`todo/${this.state.user.uid}/${key}`).update({
      complete: this.state.currentItem.complete,
    });

    // console.log(this.state.currentItem.complete);
  }

  delItem(key) {
    db.ref(`todo/${this.state.user.uid}/${key}`).remove();
  }

  render() {
    return (
      <div className="home">
        <div className="jumbo">
          <Header />
          {!this.state.user.emailVerified ? (
            <div className="email-confirm">
              <h1>Please verify your email address</h1>
              <p>
                In order to use "To do list", you need to confirm your email
                address
              </p>
              <button
                className="verify-btn"
                type="button"
                onClick={this.userVerification}
              >
                Verify email address
              </button>
            </div>
          ) : (
            <>
              {/* todo area */}{" "}
              <div className="todo-container">
                <h1 className="title-todo">What would you do today?</h1>
                <form onSubmit={this.handleSubmit}>
                  <input
                    placeholder="Type activity"
                    className="inputAct"
                    name="content"
                    onChange={this.handleChange}
                    value={this.state.currentItem.content}
                  ></input>

                  {this.state.error ? (
                    <p className="text-danger">{this.state.error}</p>
                  ) : null}
                  <button type="submit" className="btn-submit">
                    +
                  </button>

                  {/* loading indicator */}
                  {this.state.loading ? (
                    <div className="spinner-border text-success" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                  ) : (
                    ""
                  )}
                </form>
                <ul>
                  {this.state.todo.map((item) => {
                    if (item.complete) {
                      return (
                        <li key={item.key} className="complete-item">
                          {item.content}

                          <button
                            className="del"
                            onClick={() => this.delItem(item.key)}
                          >
                            X
                          </button>
                          <img
                            src={check}
                            className="done"
                            alt="check"
                            onClick={() => this.completeItem(item.key)}
                          ></img>
                          <br />
                        </li>
                      );
                    } else {
                      return (
                        <li key={item.key} className="item">
                          {item.content}

                          <button
                            className="del"
                            onClick={() => this.delItem(item.key)}
                          >
                            X
                          </button>
                          <img
                            src={check}
                            className="done"
                            alt="check"
                            onClick={() => this.completeItem(item.key)}
                          ></img>
                          <br />
                        </li>
                      );
                    }
                  })}
                </ul>
              </div>
              <div className="userName">
                <p>
                  Login in as:{" "}
                  <strong className="text-info">{this.state.user.email}</strong>
                </p>
              </div>
            </>
          )}
          <div></div>
        </div>
      </div>
    );
  }
}
