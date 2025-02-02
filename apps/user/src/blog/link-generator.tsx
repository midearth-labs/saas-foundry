
import { Link } from "react-router";

export function CreateLink({href, children}: {href: string, children: React.ReactNode}) {
    return <Link to={href}>{children}</Link>;
  }
  