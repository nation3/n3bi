describe('N3BI UI', () => {

  it('should load the N3BI page', () => {
    cy.visit('/n3bi')
    cy.get('h2').contains('Basic Income for Nation3 Citizens')
  })
})

export {}
