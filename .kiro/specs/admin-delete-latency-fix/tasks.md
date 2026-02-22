# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - Delete Operation UI Latency
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the ~800ms UI update latency exists
  - **Scoped PBT Approach**: Scope the property to concrete delete operations (article, show, episode, event, resource) to ensure reproducibility
  - Test that handleConfirmDelete updates UI within 50ms for all content types (from Fault Condition in design)
  - The test assertions should match the Expected Behavior Properties from design (immediate UI update)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists with ~800ms latency)
  - Document counterexamples found (e.g., "Article delete takes 800ms to update UI instead of <50ms")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Delete Operations and Rollback Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-delete operations (create, edit, publish, filter)
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Test confirmation dialog still appears before deletion
  - Test authentication checks still function
  - Test error handling for server/network errors still works
  - Test pagination, filtering, sorting continue to work
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [-] 3. Fix for admin delete latency

  - [x] 3.1 Implement optimistic UI updates in AdminArticlesPage.tsx
    - Store reference to deleted item before removal for potential rollback
    - Move state update (setArticles filter) to occur BEFORE API call
    - Decrement total count immediately (setTotal)
    - Wrap API call in try/catch for error handling
    - Implement rollback in catch block: restore item to original position using splice
    - Restore total count on failure
    - Update toast notifications: success after API, error on failure
    - _Bug_Condition: isBugCondition(input) where input.action == 'delete' AND input.confirmed == true AND input.contentType == 'article' AND uiUpdateDelay > 500ms_
    - _Expected_Behavior: UI updates within 50ms, item removed immediately, rollback on failure (from Property 1)_
    - _Preservation: Confirmation dialog, authentication, error handling, non-delete operations unchanged (from Preservation Requirements)_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_

  - [x] 3.2 Implement optimistic UI updates in AdminShowsPage.tsx
    - Store reference to deleted show before removal
    - Move state update (setShows filter) to occur BEFORE API call
    - Decrement total count immediately
    - Wrap API call in try/catch
    - Implement rollback: restore show to original position
    - Restore total count on failure
    - Update toast notifications appropriately
    - _Bug_Condition: isBugCondition(input) where input.contentType == 'show'_
    - _Expected_Behavior: Immediate UI update with rollback capability_
    - _Preservation: All existing show management behaviors unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_

  - [x] 3.3 Implement optimistic UI updates in AdminEpisodesPage.tsx
    - Store reference to deleted episode before removal
    - Move state update (setEpisodes filter) to occur BEFORE API call
    - Decrement total count immediately
    - Wrap API call in try/catch
    - Implement rollback: restore episode to original position
    - Restore total count on failure
    - Update toast notifications appropriately
    - _Bug_Condition: isBugCondition(input) where input.contentType == 'episode'_
    - _Expected_Behavior: Immediate UI update with rollback capability_
    - _Preservation: All existing episode management behaviors unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_

  - [x] 3.4 Implement optimistic UI updates in AdminEventsPage.tsx
    - Store reference to deleted event before removal
    - Move state update (setEvents filter) to occur BEFORE API call
    - Decrement total count immediately
    - Wrap API call in try/catch
    - Implement rollback: restore event to original position
    - Restore total count on failure
    - Update toast notifications appropriately
    - _Bug_Condition: isBugCondition(input) where input.contentType == 'event'_
    - _Expected_Behavior: Immediate UI update with rollback capability_
    - _Preservation: All existing event management behaviors unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_

  - [x] 3.5 Implement optimistic UI updates in AdminResourcesPage.tsx
    - Store reference to deleted resource before removal
    - Move state update (setResources filter) to occur BEFORE API call
    - Decrement total count immediately
    - Wrap API call in try/catch
    - Implement rollback: restore resource to original position
    - Restore total count on failure
    - Update toast notifications appropriately
    - _Bug_Condition: isBugCondition(input) where input.contentType == 'resource'_
    - _Expected_Behavior: Immediate UI update with rollback capability_
    - _Preservation: All existing resource management behaviors unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_

  - [ ] 3.6 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Immediate UI Update on Delete
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior (UI update within 50ms)
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed - UI updates immediately)
    - _Requirements: 2.1, 2.2_

  - [ ] 3.7 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Delete Operations Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (confirmation dialog, auth, error handling, non-delete operations)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
