import React, { Component } from 'react'
import { observer } from 'mobx-react';

import { getUserData, getOrgs, getOrgData, getRepos } from "../github-api"

import Repos from './Repos';
import Orgs from './Orgs';
import UserInfo from './UserInfo';
import SearchForm from "./SearchForm"

import "./Info.css"
import { Typography } from '@material-ui/core';

const Info = observer(class Info extends Component {

  constructor(props) {
    super(props);

    this.getData()

    this.props.store.setLoadStatus("repos", false)
    this.props.store.setLoadStatus("orgs", false)
    this.props.store.setLoadStatus("userData", false)
  }

  componentDidUpdate(prevProps) {

    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.props.store.clearAll()
      this.props.store.setLoadStatus("repos", false)
      this.props.store.setLoadStatus("orgs", false)
      this.props.store.setLoadStatus("userData", false)
      this.getData()
    }
  }

  getData() {

    getUserData(this.props.match.params.username)
      .then(data => {
        console.log()
        this.props.store.user.setUser({
          username: data.login,
          name: data.name === null ? "" : data.name,
          avatar: data.avatar_url,
          url: data.html_url,
          location: data.location === null ? "not defined" : data.location
        })
        this.props.store.setLoadStatus("userData", true)

      })
      .catch(error => console.log(error))

    getRepos(this.props.match.params.username)
      .then(repos => {
        repos.forEach(repo => {
          this.props.store.addRepo({
            name: repo.name,
            url: repo.html_url,
            language: repo.language === null ? "undefined" : repo.language
          })
        });

        this.props.store.setLoadStatus("repos", true)
      })
      .catch(error => console.log(error))

    getOrgs(this.props.match.params.username)
      .then(orgs => {
        orgs.forEach(org => {
          getOrgData(org.login)
            .then(orgData => {
              this.props.store.addOrg({
                name: org.login,
                url: orgData.html_url,
                repos: orgData.public_repos
              })
            })
        });
        this.props.store.setLoadStatus("orgs", true)
      })
      .catch(error => console.log(error))
  }


  render() {
    return (
      <div className="info-container">
        <div className="info-header">
          <SearchForm store={this.props.store} />

          <Typography component="h1" variant="h3">
            GitHub user info
        </Typography>
        </div>
        <div className="info-columns">
          <div className="info-left">
            <Repos store={this.props.store} />
          </div>
          <div className="info-right">
            <UserInfo store={this.props.store} />
            <Orgs store={this.props.store} />
          </div>

        </div>
      </div>

    )
  }
})

export default Info
