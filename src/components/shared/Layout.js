import React from "react";
import { useLayoutStyles } from "../../styles";
import SEO from "./Seo";
import Navbar from "./Navbar";


function Layout({ children, minimalNavbar = false, title, marginTop = 60 }) {
  const classes = useLayoutStyles();

  return (
    <section className={classes.section}>
      <Navbar minimalNavbar={minimalNavbar} />
      <SEO title={title} />
      <main className={classes.main} style={{ marginTop }} >
        <section className={classes.childrenWrapper}>
          <div className={classes.children}>
            {children}
          </div>
        </section>
      </main>
    </section>
  ); 
}

export default Layout;
