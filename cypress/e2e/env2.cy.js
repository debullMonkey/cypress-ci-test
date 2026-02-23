const BASE_URL = 'http://localhost:4002'
const EXPECTED_ENV = 'env2'

describe(`[${EXPECTED_ENV}] 기본 기능 테스트`, () => {

  describe('API 헬스체크', () => {
    it('GET /api/health 가 정상 응답을 반환한다', () => {
      cy.request(`${BASE_URL}/api/health`).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body.status).to.eq('ok')
        expect(res.body.env).to.eq(EXPECTED_ENV)
      })
    })

    it('GET /api/items 가 상품 목록을 반환한다', () => {
      cy.request(`${BASE_URL}/api/items`).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.be.an('array')
        expect(res.body.length).to.be.greaterThan(0)
      })
    })
  })

  describe('페이지 렌더링', () => {
    beforeEach(() => {
      cy.visit(BASE_URL)
    })

    it('페이지 타이틀이 표시된다', () => {
      cy.contains('h1', 'Practice App').should('be.visible')
    })

    it('서버 상태가 ok로 표시된다', () => {
      cy.get('[data-testid="status"]', { timeout: 10000 }).should('have.text', 'ok')
    })

    it(`환경이 ${EXPECTED_ENV}로 표시된다`, () => {
      cy.get('[data-testid="env"]', { timeout: 10000 }).should('have.text', EXPECTED_ENV)
    })

    it('상품 목록이 3개 표시된다', () => {
      cy.get('[data-testid="item-list"] li', { timeout: 10000 }).should('have.length', 3)
    })
  })
})
