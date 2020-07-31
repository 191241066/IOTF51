class MiFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = /* html */
            `Copyright &copy; 2020 Mario Ramirez Toala.`;
    }
}
customElements.define("mi-footer", MiFooter);