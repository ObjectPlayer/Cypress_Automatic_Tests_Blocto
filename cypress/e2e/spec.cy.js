import * as TmpMail from "tmpmail";

describe("template spec", () => {
  const mainUrl = "https://regression3.troontech.com";
  it("visit sign-up", () => {
    const client = TmpMail.Create();

    client.on("ready", (email) => {
      console.log(email);

      // Or, alternatively:
      console.log(client.id);
    });

    const readMessages = () => {
      // return a promise that resolves after 1 second
      return new Cypress.Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(client.fetch());
        }, 5000);
      });
    };

    const dropUrl = `${mainUrl}/drops/drop-details/834c7af7-de4f-4c40-b75d-223d33ea80f0/22863ba7-cbf7-49b8-8662-219a0aee68e7`;
    cy.visit(`${dropUrl}`);
    cy.wait(500);
    cy.reload(true);
    cy.get("button").contains("Claim").click();
    cy.wait(1000);
    Cypress.Commands.add("iframe", { prevSubject: "element" }, ($iframe) => {
      return new Cypress.Promise((resolve) => {
        $iframe.on("load", () => {
          resolve($iframe.contents().find("body"));
        });
      });
    });

    cy.get("#FCL_IFRAME")
      .iframe()
      .should("be.visible")
      .should("not.be.empty")
      .then(($iframe) => {
        cy.wrap($iframe).find('input[placeholder="Email"]').type(client.id);

        cy.wrap($iframe)
          .find('button[class*="EmailInput__StyledButton-jkKVAa"]')
          .click();

        readMessages().then((messages) => {
          console.log("messages ", messages);
          client.findMessage(messages[0]._id).then((msg) => {
            console.log("message", msg.body);
            var regExp = /\(([^)]+)\)/;
            var matches = regExp.exec(msg.body.text);
            let otp = matches[1].substring(1, matches[1].length - 1);
            console.log(otp);
            localStorage.setItem("otp", otp);
          });
        });

        cy.wait(7000).then(() => {
          let otp = localStorage.getItem("otp");
          cy.wrap($iframe)
            .find('input[class*="EmailConfirm__HiddenInput-CJIJM"]')
            .type(otp);
        });

        cy.wait(5000).then(() => {
          cy.wrap($iframe)
            .find('button[class*="AccountConfirm__ConfirmButton-cmGgtf ACXKM"]')
            .click();
        });

        cy.wait(5000).then(() => {
          const getIframeDocument = () => {
            return cy
              .get('iframe[id="FCL_IFRAME"]')
              .its("0.contentDocument")
              .should("exist");
          };

          const getIframeBody = () => {
            return getIframeDocument()
              .its("body")
              .should("not.be.undefined")
              .then(cy.wrap);
          };

          getIframeBody()
            .find('button[class*="Layout__StyledButton-kaKoQr"]')
            .click();
        });
      });
  });
});
