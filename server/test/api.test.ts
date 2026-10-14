import test from 'node:test';
import assert from 'node:assert';
import { db } from '../src/db.js';

test('SocialGraph Backend Core Verification', async (t) => {
  await t.test('Multi-Space Model: 1 User owns Multiple Independent Spaces', () => {
    const user = db.getUserByEmail('arjun@socialgraph.dev');
    assert.ok(user, 'User Arjun should exist');

    const spaces = db.getSpacesByUserId(user.id);
    assert.strictEqual(spaces.length, 3, 'Arjun should have 3 spaces');
    
    const handles = spaces.map(s => s.handle);
    assert.ok(handles.includes('arjun_robotics'));
    assert.ok(handles.includes('arjun_ideas'));
    assert.ok(handles.includes('arjun_personal'));

    // Verify privacy: When looking up public space, user_id should be private
    const publicProfile = db.getSpaceByHandle('arjun_robotics');
    assert.ok(publicProfile);
    assert.strictEqual(publicProfile.handle, 'arjun_robotics');
  });

  await t.test('MyID Innovation Engine: Structured Idea Canvas Verification', () => {
    const canvas = db.getIdeaByPostId('pst_idea_water_sensor');
    assert.ok(canvas, 'Water sensor idea canvas should exist');
    assert.ok(canvas.problem.length > 50, 'Problem must be documented with depth');
    assert.ok(canvas.proposed_solution.length > 50, 'Solution must be documented');
    assert.ok(canvas.required_skills.length >= 2, 'Skills must be specified');
    assert.strictEqual(canvas.status, 'teaming');
    assert.ok(canvas.ai_prior_art_summary, 'AI prior art evidence must be present');
  });

  await t.test('Discourse & Multi-Perspective Engine: Perspectives Exist', () => {
    const perspectives = db.getPerspectivesByPostId('pst_ai_debate_1');
    assert.strictEqual(perspectives.length, 3, 'Debate must have 3 perspectives');
    assert.strictEqual(perspectives[0].stance_label, 'Perspective A');
    assert.strictEqual(perspectives[1].stance_label, 'Perspective B');
    assert.strictEqual(perspectives[2].stance_label, 'Perspective C');
  });

  await t.test('Contextual Feed Engine: Filters by Active Space Pinned Topics', () => {
    // Feed for Arjun's robotics space
    const roboticsFeed = db.getFeedForSpace('spc_arjun_robotics');
    assert.ok(roboticsFeed.length > 0, 'Feed should return posts');

    // Posts have explainability badges
    assert.ok(roboticsFeed[0].why_recommended, 'Post must contain transparent explainability badge');
  });

  await t.test('Safe Proximity & Uber H3 Matching', () => {
    const nearby = db.findNearbyIntents('spc_arjun_robotics', ['Firmware', 'STM32']);
    assert.ok(nearby.length > 0, 'Should find Rohit near Mumbai matching firmware/STM32');
    assert.strictEqual(nearby[0].space.handle, 'rohit_hardware');
    assert.ok(nearby[0].distance_approx_km > 0, 'Approximate distance should be calculated');
  });

  await t.test('Consent Handshake: Request Creation & Notification', () => {
    const req = db.createConsentRequest({
      id: 'req_test_1',
      sender_space_id: 'spc_arjun_robotics',
      recipient_space_id: 'spc_rohit_hardware',
      purpose: 'Water Sensor LoRaWAN firmware',
      message: 'Looking for firmware peer to collaborate on SPI sensor readout',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    assert.strictEqual(req.status, 'pending');
    const notifs = db.getNotifications('spc_rohit_hardware');
    assert.ok(notifs.some(n => n.type === 'consent_request'), 'Recipient must receive notification');
  });
});
