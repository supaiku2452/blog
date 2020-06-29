import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { library } from "@fortawesome/fontawesome-svg-core"
import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons"
import { faHome, faRss, faTags } from "@fortawesome/free-solid-svg-icons"

const useableIcons = ["home", "rss", "tags"]
const useableBrandIcons = ["twitter", "github"]

library.add(faGithub, faTwitter, faHome, faRss, faTags)

export const Icon = ({ iconName }) => {
  if (useableIcons.includes(iconName)) {
    return <FontAwesomeIcon icon={iconName} />
  } else if (useableBrandIcons.includes(iconName)) {
    return <FontAwesomeIcon icon={["fab", iconName]} />
  }
  return null
}
